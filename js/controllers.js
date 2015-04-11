var appControllers = angular.module('appControllers', []);


appControllers.controller('SettingsController', ['$scope', '$window',
    function ($scope, $window) {
        $scope.url = $window.sessionStorage.baseurl;

        $scope.setUrl = function () {
            $window.sessionStorage.baseurl = $scope.url;
            $scope.displayText = "URL set";
        };

    }]);


appControllers.controller('UsersController', ['$q', '$http', '$scope', '$window', 'UsersService', 'IdService',
    function ($q, $http, $scope, $window, UsersService, IdService) {
        UsersService.get().success(function (data) {
            $scope.data = data;
            $scope.users = $scope.data.data;

        });

        $scope.deleteClicked = function (event, userId) {
            var delete_elem = $('#' + userId);

            var taskPromises = [];
            var tasks = [];

            UsersService.get_assoc_tasks(userId)
                .then(function (response) {
                    tasks = response.data.data;

                    angular.forEach(tasks, function (task) {
                        task.assignedUser = "";
                        task.assignedUserName = "Unassigned";
                        taskPromises.push(UsersService.remove_task_from_user(task._id, task));

                    });
                });
            $q.all(taskPromises)
                .then(function (responses) {
                    UsersService.delete_user(userId).success(function () {
                        delete_elem.slideUp("slow");
                    });
                });

        };

        $scope.userClicked = function (id_of_clicked) {
            IdService.setId(id_of_clicked);
        };

    }]);

appControllers.controller('AddUserController', ['$http', '$scope', '$window', 'AddUserService',
    function ($http, $scope, $window, AddUserService) {
        var userError = true;
        var emailError = true;
        $scope.email = "";
        $scope.user = "";

        $scope.updateUsername = function () {
            $(".alert-success").slideUp("fast");

            if ($scope.username.length == 0) {
                userError = true;
                $('.username-class').slideDown("fast");
                $('#the-error').html("Required Field");
            }
            else {
                AddUserService.testUsername($scope.username.toLowerCase()).success(function (data) {
                    if (data.data.length != 0) {
                        userError = true;
                        $('.username-class').slideDown("fast");
                        $('#the-user-error').html("Username already taken!");
                    }
                    else {
                        if ($scope.username.length == 0) {
                            userError = true;
                            $('.username-class').slideDown("fast");
                            $('#the-user-error').html("Required Field");
                        }
                        else {
                            userError = false;
                            $('.username-class').slideUp("fast");
                        }

                    }
                });
            }
            if(userError || emailError || $scope.email.length < 5){
                $('#createUserBtn').addClass("disabled");
            }
            else{
                $('#createUserBtn').removeClass("disabled");
            }
        };

        $scope.updateEmail = function () {
            $(".alert-fail").slideUp("fast");
            $(".alert-success").slideUp("fast");

            if ($scope.email.length == 0) {
                emailError = true;
                $('#the-email-error').html("Required Field").slideDown("fast");
            }
            else {
                if(($scope.email.indexOf("@") < 0 || $scope.email.indexOf(".") < 0 )&& $scope.email.length > 2){
                    emailError = true;
                    $('#the-email-error').slideDown("fast").html("Must be a valid email!");
                }
                else{
                    emailError = false;
                    $('#the-email-error').slideUp("fast");
                }
            }
            if(userError || emailError || $scope.email.length < 5){
                $('#createUserBtn').addClass("disabled");
            }
            else{
                $('#createUserBtn').removeClass("disabled");
            }
        };

        $scope.createUser = function () {
            if(userError || emailError || $scope.email.length < 5){
                return;
            }

            AddUserService.create_user($scope.username, $scope.email).success(function (data) {;
                $(".alert-success").slideDown("fast");
                $(".alert-fail").slideUp("fast");
            }).error(function (data) {
                $(".alert-fail").slideDown("fast");
                $(".alert-success").slideUp("fast");
            });


        }


    }]);

appControllers.controller('UserDetailsController', ['$http', '$scope', '$window', '$location', 'UserDetailsService', 'IdService', 'TaskDetailsService',
    function ($http, $scope, $window, $location, UserDetailsService, IdService, TaskDetailsService) {

        $scope.id = IdService.getId();
        var bodyResponse;
        var transfered;
        var shown = false;

        if ($scope.id == "") {
            $scope.id = $location.path().split('/users/')[1];
        }

        UserDetailsService.get($scope.id)
            .then(function (getResponse) {
                bodyResponse = getResponse.data;
                $scope.user = bodyResponse.data;
                $scope.formatDate = new Date($scope.user.dateCreated).toLocaleDateString();
                return UserDetailsService.getTasks($scope.user.pendingTasks);
            })
            .then(function (taskResponse) {
                $scope.pendingTasks = taskResponse.data.data;
            });

        $scope.showCompleted = function () {
            if(!shown){

                shown = true;
                $('.initial-hidden').slideDown("fast");
                var bottom_of_div = $('.initial-hidden').position().top + $('.initial-hidden').outerHeight(true);
                $("html, body").animate({scrollTop: bottom_of_div});
            }
            else{
                shown = false;
                $('.initial-hidden').slideUp();
            }

            UserDetailsService.get_completed_tasks($scope.id)
                .then(function (response) {
                    $scope.completedTasks = response.data.data;

                });
        };

        var removeFromPending = function (remove_id) {
            for (var i = 0; i < $scope.user.pendingTasks.length; i++) {
                if (remove_id == $scope.user.pendingTasks[i]) {
                    $scope.user.pendingTasks.splice(i, 1);
                    $('#' + remove_id).slideUp("fast");
                    transfered = remove_id;
                    if ($scope.user.pendingTasks.length == 0) {
                        $scope.user.pendingTasks = [];
                    }

                }
            }
        };

        $scope.taskClicked = function (taskId) {
            //stuff
        };

        $scope.completeClicked = function (event, taskId) {
            TaskDetailsService.get_task(taskId)
                .then(function (response) {
                    var task = response.data.data;
                    task.completed = true;
                    removeFromPending(taskId);
                    return TaskDetailsService.update_task(taskId, task)
                })
                .then(function (response) {
                    return UserDetailsService.update_user($scope.id, $scope.user)
                })
                .then(function (response) {
                    $("#completedTaskList").append($('#' + transfered));

                    $("#complete-button-" + transfered).css("display", "none");
                    $('#' + transfered).slideDown("fast");

                });

        };


    }]);


appControllers.controller('TasksController', ['$http', '$scope', '$window', 'TasksService', 'IdService', 'UserDetailsService', 'TaskDetailsService',
    function ($http, $scope, $window, TasksService, IdService, UserDetailsService, TaskDetailsService) {
        var max_count;
        TasksService.get().success(function (data) {
            $scope.data = data;
            $scope.tasks = $scope.data.data;

        });

        TasksService.getCount().success(function(response){
            max_count = response.data;
        });

        $scope.sort = "deadline";
        $scope.ascendSort = "descending";
        $scope.filter = "pending";
        var count = 0;


        $scope.convertToString = function (date) {
            var theDate = new Date(date);
            return theDate.toLocaleDateString();
        };

        $scope.taskClicked = function (taskId) {
            IdService.setTaskId(taskId);
        };

        $scope.deleteClicked = function (event, taskId) {
            var delete_elem = $('#' + taskId);
            var associated_user;
            TaskDetailsService.get_task(taskId)
                .then(function(response){
                    var taskToDelete = response.data.data;
                    associated_user = taskToDelete.assignedUser;
                    return TasksService.deleteItem(taskId);

                })
                .then(function(response) {
                    return UserDetailsService.get(associated_user);
                })
                .then(function(response){
                    var user_obj = response.data.data;
                    if(user_obj != undefined && user_obj.pendingTasks != undefined)
                    {
                        var index = user_obj.pendingTasks.indexOf(taskId);
                        if(index >= 0){
                            user_obj.pendingTasks.splice(user_obj.pendingTasks.indexOf(taskId), 1);
                        }
                        return UserDetailsService.update_user(user_obj._id, user_obj)
                            .success(function(response){
                                delete_elem.slideUp("slow");
                            });

                    }
                    else{
                        delete_elem.slideUp("slow");
                    }

                });



        };


        $scope.nextClicked = function () {
            if(count + 10 > max_count){
                return
            }
            count += 10;
            TasksService.getNext().success(function (data) {
                $scope.data = data;
                $scope.tasks = $scope.data.data;
            }).then(function(response){
                $('.prevButton').removeClass("disabled");
                if(count+10 >= max_count ){
                    $('.nextButton').addClass("disabled");
                }
            });
        };

        $scope.prevClicked = function () {
            if(count-10 < 0){
                return;
            }
            count -= 10;
            TasksService.getPrev().success(function (data) {
                $scope.data = data;
                $scope.tasks = $scope.data.data;
            }).then(function(response){
                $('.nextButton').removeClass("disabled");
                if(count <= 0){
                        $('.prevButton').addClass("disabled");
                }
            });

        };

        $scope.$watch('sort', function (value) {
            if (value == undefined) return;
            TasksService.sortSelection(value).success(function (data) {
                $scope.data = data;
                $scope.tasks = $scope.data.data;
            });
        });

        $scope.$watch('ascendSort', function (value) {
            if (value == undefined) return;
            var input = 0;
            if (value == "ascending") input = -1;
            if (value == "descending") input = 1;

            TasksService.ascendSortSelection(input).success(function (data) {
                $scope.data = data;
                $scope.tasks = $scope.data.data;
            });
        });

        $scope.$watch('filter', function (value) {
            if (value == undefined) return;
            count = 0;
            $('.nextButton').removeClass("disabled");
            $('.prevButton').addClass("disabled");
            TasksService.filterSelection(value)
                .success(function (data) {
                $scope.data = data;
                $scope.tasks = $scope.data.data;
                TasksService.getCount().success(function(response){
                    var max_count = response.data;
                });
            })
        });


    }]);

appControllers.controller('AddTaskController', ['$http', '$scope', '$window', 'AddTaskService', 'UsersService', 'UserDetailsService',
    function ($http, $scope, $window, AddTaskService, UsersService, UserDetailsService) {

        $scope.assignedUser = "";
        $scope.assignedUserName = "unassigned";
        var nameError = true;
        var deadlineError = true;
        var descriptionError = true;

        UsersService.get()
            .then(function (response) {
                $scope.users = response.data.data;
            });


        $scope.setName = function () {
            if ($scope.name.length == 0) {
                nameError = true;
                $('#the-name-error').slideDown("fast");
                $("#newTaskBtn").addClass("disabled");
            }
            else {
                nameError = false;
                $("#alert-fail").slideUp("fast");
                $('#the-name-error').slideUp("fast");
                if(!nameError && !descriptionError && !deadlineError){
                    $("#newTaskBtn").removeClass("disabled");
                }
            }
        };

        $scope.$watch('deadlineInput', function(value){
            if(value == undefined || value.length == 0) {
                deadlineError = true;
                $('#the-date-error').slideDown("fast");
                $("#newTaskBtn").addClass("disabled");
                return;
            }
            deadlineError = false;
            $('#the-date-error').slideUp("fast");
            $scope.deadline = new Date(value).toISOString();
            if(!nameError && !descriptionError && !deadlineError){
                $("#newTaskBtn").removeClass("disabled");
            }
        });

        $scope.$watch('description', function(value){
            if(value == undefined || value.length == 0) {
                descriptionError = true;
                $('#the-description-error').slideDown("fast");
                $("#newTaskBtn").addClass("disabled");
                return;
            }
            descriptionError = false;
            $('#the-description-error').slideUp("fast");
            if(!nameError && !descriptionError && !deadlineError){
                $("#newTaskBtn").removeClass("disabled");
            }

        });

        $scope.$watch('assignedUser', function(value){
            if(value == undefined || value.length == 0 || value == "") {
                return;
            }

            UserDetailsService.get(value)
                .then(function(response){
                    $scope.assignedUserName = response.data.data.name;
                    $scope.assignedUser = response.data.data._id;

                });

        });

        $scope.createTask = function(){
            if(descriptionError || deadlineError || nameError){
                return;
            }

            var new_task = {
                name: $scope.name,
                description: $scope.description,
                deadline: $scope.deadline,
                assignedUser: $scope.assignedUser,
                assignedUserName: $scope.assignedUserName,
                completed: false
            };

            if(new_task.assignedUser == "") {
                new_task.assignedUserName = "Unassigned";
            }


            AddTaskService.create_task(new_task)
                .then(function(firstResponse){
                    curr_task = firstResponse.data.data;
                    if($scope.assignedUser != ""){
                        UserDetailsService.get($scope.assignedUser)
                            .then(function(response){
                                var curr_user = response.data.data;
                                curr_user.pendingTasks.push(curr_task._id);
                                return UserDetailsService.update_user(curr_user._id, curr_user);
                            })
                            .then(function(response){
                                if(response.data.message == "User updated"){
                                    $('.alert-fail').slideUp("fast");
                                    $('.alert-success').slideDown("fast");
                                }
                                else{
                                    $('.alert-success').slideUp("fast");
                                    $('.alert-fail').slideDown("fast");
                                }
                            });

                    }
                    else{
                        $('.alert-fail').slideUp("fast");
                        $('.alert-success').slideDown("fast");
                    }
                });




        };



    }]);

appControllers.controller('TaskDetailsController',
    ['$http', '$scope', '$window', '$location', 'TaskDetailsService',
        'IdService', 'UserDetailsService',
    function ($http, $scope, $window, $location, TaskDetailsService,
              IdService, UserDetailsService) {
        var id = IdService.getTaskId();

        if (id == "") {
            id = $location.path().split('/tasks/')[1];
        }

        $scope.id = id;

        $scope.convertToString = function (date) {
            var theDate = new Date(date);
            return theDate.toLocaleDateString();
        };

        TaskDetailsService.get_task($scope.id)
            .then(function (response) {
                $scope.task = response.data.data;
                if($scope.task.assignedUserName == "unassigned" || $scope.task.assignedUser == ""){
                    $scope.isAssigned = false;
                }
                else{
                    $scope.isAssigned = true;
                }
                $scope.isComplete = $scope.task.completed;
                $scope.notCompleted = !$scope.task.completed;
                if(!$scope.isAssigned){
                    $('.hideIfUnassigned').css("display", "none");
                }
            });

        $scope.$watch('isComplete', function (value) {
            if (value == undefined || value == $scope.task.completed) {
                return;
            }

            $scope.task.completed = value;
            TaskDetailsService.update_task($scope.task._id, $scope.task);


            UserDetailsService.get($scope.task.assignedUser)
                .then(function (response) {
                    var user = response.data.data;
                    if($scope.task.completed == true){
                        for (var i = 0; i < user.pendingTasks.length; i++) {
                            var user_pending_id = user.pendingTasks[i];
                            if (user_pending_id == id) {
                                user.pendingTasks.splice(i, 1);
                            }
                        }
                    }
                    else{
                        user.pendingTasks.push($scope.task._id);
                    }
                    return UserDetailsService.update_user(user._id, user);
                });


        });

    }]);

appControllers.controller('EditTaskController',
    ['$location', '$http', '$scope', '$window', 'EditTaskService', 'IdService',
        'TaskDetailsService', 'UsersService', 'UserDetailsService',
        function ($location, $http, $scope, $window, EditTaskService, IdService,
                  TaskDetailsService, UsersService, UserDetailsService) {
            var id = IdService.getTaskId();
            var prevUser;
            var prevUsername;
            var prevCompleted;
            $('#the-task-error').css("visibility", "hidden");


            if (id == "") {
                id = $location.path().split('/tasks/')[1].split('/edit_task')[0];
            }

            UsersService.get()
                .then(function (response) {
                    $scope.users = response.data.data;
                });

            TaskDetailsService.get_task(id)
                .then(function (response) {
                    $scope.task = response.data.data;
                    $scope.task.deadline = new Date($scope.task.deadline).toLocaleDateString();
                    prevUsername = $scope.task.assignedUserName;
                    prevUser = $scope.task.assignedUser;
                    prevCompleted = $scope.task.completed;
                });


            $scope.updateName = function () {
                if ($scope.task.name.length == 0) {
                    $('#the-task-error').css("visibility", "").slideDown("fast");
                }
                else {
                    $("#the-task-error").slideUp("fast");
                }
            };

            $scope.changedAssigned = function (name) {
                $scope.task.assignedUserName = name;
            };

            $scope.submitEdit = function () {
                $scope.task.deadline = new Date($scope.task.deadline).toISOString();
                $scope.task.assignedUserName = $('#getName').find('option:selected').text();

                //If the task was pending
                if (!prevCompleted) {
                    //And we are using the same user
                    if (prevUser == $scope.task.assignedUser) {
                        //And now it is completed. Remove it from pending
                        if ($scope.task.completed) {
                            UserDetailsService.get($scope.task.assignedUser)
                                .then(function (response) {
                                    var user = response.data.data;
                                    for (var i = 0; i < user.pendingTasks.length; i++) {
                                        var user_pending_id = user.pendingTasks[i];
                                        if (user_pending_id == id) {
                                            user.pendingTasks.splice(i, 1);
                                        }
                                    }
                                    return UserDetailsService.update_user(user._id, user);
                                });
                        }
                        //And it is still pending do nothing
                        else {
                        }
                    }
                    //And we are on a different user now, remove from old no matter what
                    else {
                        UserDetailsService.get(prevUser)
                            .success(function (response) {
                                var user = response.data.data;
                                if(user != undefined && user.pendingTasks != undefined){
                                    for (var i = 0; i < user.pendingTasks.length; i++) {
                                        var user_pending_id = user.pendingTasks[i];
                                        if (user_pending_id == id) {
                                            user.pendingTasks.splice(i, 1);
                                        }
                                    }
                                    return UserDetailsService.update_user(user._id, user);
                                }
                            })
                            .success(function (response) {
                                //if it is now completed do nothing
                                if ($scope.task.completed) {
                                }
                                //else it is still pending and need to add to the new list
                                else {
                                    UserDetailsService.get($scope.task.assignedUser)
                                        .then(function (response) {
                                            var user = response.data.data;
                                            if (!$scope.task.completed) {
                                                user.pendingTasks.push($scope.task._id);
                                                return UserDetailsService.update_user(user._id, user);
                                            }
                                        });
                                }

                            });
                    }
                }
                //Else if the task was completed
                else {
                    //if it is now pending just add to whatever one it is pending for
                    if (!$scope.task.completed) {
                        UserDetailsService.get($scope.task.assignedUser)
                            .then(function (response) {
                                var user = response.data.data;
                                if (!$scope.task.completed) {
                                    user.pendingTasks.push($scope.task._id);
                                    return UserDetailsService.update_user(user._id, user);
                                }
                            });
                    }
                    //Else still complete and do nothing
                    else {
                    }
                }

            TaskDetailsService.update_task(id, $scope.task)
                .then(function (response) {
                    //var bottom_of_div = $('.alert-success').position().top + $('.alert-success').outerHeight(true);
                    //$("html, body").animate({scrollTop: bottom_of_div});
                    $(".alert-success").slideDown("fast");
                },
                function (response) {
                    //var bottom_of_div = $('.alert-fail').position().top + $('.alert-fail').outerHeight(true);
                    //$("html, body").animate({scrollTop: bottom_of_div});
                    $(".alert-fail").slideDown("fast");
                });

        };


}])
;


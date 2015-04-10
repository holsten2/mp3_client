// js/services/todos.js
angular.module('appServices', [])
    .factory('IdService', function(){
        var id = "";
        var taskId = "";
        return{
            getId : function(){
                return id;
            },
            setId : function(newId){
                id = newId;
            },
            getTaskId : function(){
                return taskId;
            },
            setTaskId : function(newId){
                taskId = newId;
            }
        }
    })
    .factory('UsersService', function($http, $window) {
        return{
            get: function () {
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/users?select={\"_id\" : 1, \"name\" : 1}');
            },
            delete_user: function (id) {
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.delete(baseUrl+'/api/users/'+id);
            },
            get_assoc_tasks : function(id){
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks?where={\"assignedUser\" :\"' + id + '\"}');
            },
            remove_task_from_user : function(id, new_task){
                var baseUrl = $window.sessionStorage.baseurl;
                var request = {
                    method: 'PUT',
                    url: baseUrl + '/api/tasks/' + id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param(new_task)
                };
                return $http(request);


            }

        }

    }).factory('AddUserService', function($http, $window) {
        return {
            testUsername : function(new_name) {
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/users?where={"name" : \"' + new_name + '\"}');
            },
            create_user: function(theName, theEmail) {
                var baseUrl = $window.sessionStorage.baseurl;
                var request = {
                    method: 'POST',
                    url: baseUrl + '/api/users',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param({name:theName,email:theEmail})
                };
                return $http(request);
            }
        }
    }).factory('UserDetailsService', function($http, $window) {
        return {
            get : function(id) {
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/users/' + id);
            },
            getTasks : function(ids){
                var baseUrl = $window.sessionStorage.baseurl;
                var string_ids = "";
                var i;
                for (i=0;i < ids.length; i++){
                    string_ids += "\"" + ids[i] + "\","
                }
                string_ids = string_ids.substr(0, string_ids.length - 1);
                //console.log(baseUrl+'/api/tasks?where={\"_id\": {"$in":['+ string_ids +']}}');
                return $http.get(baseUrl+'/api/tasks?where={\"_id\": {"$in":['+ string_ids +']}}');
            },
            get_completed_tasks : function(id){
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks?where={\"assignedUser\" : \"' + id + '\", \"completed\" : true}');
            },
            update_user : function(id, new_user){
                var baseUrl = $window.sessionStorage.baseurl;
                var request = {
                    method: 'PUT',
                    url: baseUrl + '/api/users/' + id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param(new_user)
                };
                return $http(request);
            }
        }
    })
    .factory('TasksService', function($http, $window) {
        var offset = 0;
        var sortAscend = 1;
        var sortVar = "deadline";
        var sortStatement = '&sort={\"'+ sortVar +'\" : '+ sortAscend +'}';
        var whereStatement = '&where={"completed" : false}';
        var selectStatement = '&select={\"_id\" : 1, \"name\" : 1, \"assignedUserName\" : 1, \"deadline\" : 1}';

        return {
            get : function() {
                var baseUrl = $window.sessionStorage.baseurl;
                var retVal = $http.get(baseUrl+'/api/tasks?skip=' + offset + '&limit=10'+ sortStatement + whereStatement + selectStatement);
                return retVal;
            },
            getCount : function(){
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks/?count=true' + whereStatement);
            },
            deleteItem : function(id){
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.delete(baseUrl+'/api/tasks/'+id);
            },
            getNext : function() {
                offset += 10;
                var baseUrl = $window.sessionStorage.baseurl;
                console.log(baseUrl+'/api/tasks?skip=' + offset + '&limit=10'+ sortStatement + whereStatement + selectStatement);
                return $http.get(baseUrl+'/api/tasks?skip=' + offset + '&limit=10'+ sortStatement + whereStatement + selectStatement);
            },
            getPrev : function() {
                offset -= 10;
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks?skip=' + offset + '&limit=10'+ sortStatement + whereStatement + selectStatement);
            },
            sortSelection : function(newSortVar) {
                sortVar = newSortVar;
                sortStatement = '&sort={\"'+ sortVar +'\" : '+ sortAscend +'}';
                offset = 0;
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks?skip=' + offset + '&limit=10' + sortStatement + whereStatement + selectStatement);
            },
            ascendSortSelection : function(newSort){
                sortAscend = newSort;
                sortStatement = '&sort={\"'+ sortVar +'\" : '+ sortAscend +'}';
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks?skip=' + offset + '&limit=10' + sortStatement + whereStatement + selectStatement);
            },
            filterSelection : function(value){
                offset = 0;
                if(value === "all") whereStatement = '&where={}';
                else if(value === "completed") whereStatement = '&where={\"completed\" : true}';
                else whereStatement = '&where={\"completed\" : false}';
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks?skip=' + offset + '&limit=10' + sortStatement + whereStatement);
            }
        }
    })
    .factory('TaskDetailsService', function($http, $window) {
        return {
            get_task : function(id) {
                var baseUrl = $window.sessionStorage.baseurl;
                return $http.get(baseUrl+'/api/tasks/' + id);
            },
            update_task : function(id, updated) {
                var baseUrl = $window.sessionStorage.baseurl;
                var request = {
                    method: 'PUT',
                    url: baseUrl + '/api/tasks/' + id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param(updated)
                };
                return $http(request);
            }
        }
    })
    .factory('AddTaskService', function($http, $window) {
        return {

            create_task : function(obj){
                var baseUrl = $window.sessionStorage.baseurl;
                var request = {
                    method: 'POST',
                    url: baseUrl + '/api/tasks',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param(obj)
                };
                return $http(request);
            }

        }
    })
    .factory('EditTaskService', function($http, $window) {
        return {

        }
    })
;

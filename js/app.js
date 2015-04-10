var managerApp = angular.module('managerApp', ['ngRoute', 'appControllers', 'appServices','720kb.datepicker']);

managerApp.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/settings', {
            templateUrl: 'partials/settings.html',
            controller: 'SettingsController'
        }).
        when('/users', {
            templateUrl: 'partials/users.html',
            controller: 'UsersController'
        }).
        when('/tasks', {
            templateUrl: 'partials/tasks.html',
            controller: 'TasksController'
        }).
        when('/users/:user_id', {
            templateUrl: 'partials/user_details.html',
            controller: 'UserDetailsController'
        }).
        when('/tasks/:task_id', {
            templateUrl: 'partials/task_details.html',
            controller: 'TaskDetailsController'
        }).
        when('/tasks/:task_id/edit_task', {
            templateUrl: 'partials/edit_task.html',
            controller: 'EditTaskController'
        }).
        when('/add_user', {
            templateUrl: 'partials/add_user.html',
            controller: 'AddUserController'
        }).
        when('/add_task', {
            templateUrl: 'partials/add_task.html',
            controller: 'AddTaskController'
        }).
        otherwise({
            redirectTo: '/settings'
        });
}]);
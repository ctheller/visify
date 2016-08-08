app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state, PlayerFactory) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

                scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    PlayerFactory.pause();
                    $state.reload();
                });
            };

            var setUser = function () {
                scope.user = $rootScope.user;
            };

            var removeUser = function () {
                scope.user = null;
            };

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});

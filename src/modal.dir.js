angular.module('modal')
  .directive('modal', function($rootScope, $compile, $document, $templateCache, $http) {
    var body = $document.find('body');

    return {
      restrict: 'A',
      transclude: 'true',
      scope: {
        // TODO
        width: '&?',
        // TODO
        height: '&?',
        template: '&?',
        templateUrl: '&?',
        scope: '=?',
        controller: '&?'
      },
      template: '<div class="modal-focus">',
      require: 'modal',
      controllerAs: 'modal',
      controller: function($scope, $q) {
        var deferred = $q.defer();
        this.resolve = deferred.resolve;
        this.reject = deferred.reject;
        this.promise = deferred.promise;

        this.blur = function(el) {
          body.children().addClass('modal-blur');
          var parent = el;
          while (parent.length) {
            parent.removeClass('modal-blur');
            parent = parent.parent();
          }

          // Expose promise/blur to the service
          $scope.promise = this.promise;
          $scope.blur = this.blur;
        };
      },
      link:  function(scope, el, attrs , ctrl, transclude) {
        var modal = true;
        var service = attrs.hasOwnProperty('service');

        ctrl.blur(el);

        // FIXME: refactor to controller
        scope.$close = function() {
          ctrl.resolve();
          close();
        };
        scope.$dismiss = function() {
          ctrl.reject();
          close();
        };
        function close() {
          body.children().removeClass('modal-blur');

          modal = false;
          if (service)
            el.remove();
        }

        // Listen for `ESC`
        var esc = function esc(e) {
          if (e.which === 27) {
            $document.off('keyup', esc);
            scope.$dismiss();
          }
        };
        $document.on('keyup', esc);

        // Listen for off-modal clicks
        var off = function off(e) {
          // FIXME: blur is not a target
          if (e.target === blur) {
            $document.off('click', off);
            scope.$dismiss();
          }
        };
        $document.on('click', off);

        transclude(function transcludeModal(clone) {
          if (scope.template() || scope.templateUrl()) {
            var template =
              scope.template() || $templateCache.get(scope.templateUrl());

            if (!template) {
              $http.get(scope.templateUrl()).success(function(template) {
                $templateCache.put(scope.templateUrl(), template);
              });
                transcludeModalClone(
                  $compile(template)(scope.scope || scope, scope.controller()));
            } else
              transcludeModalClone(
                $compile(template)(scope.scope || scope, scope.controller()));
          } else
            transcludeModalClone(clone);

          function transcludeModalClone(clone) {
            var cloneScope = clone.scope();

            // Expose `.close` to transcluded scope
            cloneScope.$close = scope.$close;
            cloneScope.$dismiss = scope.$dismiss;

            // Transclude the element manually
            el.find('div').append(clone);

            // Listen for $destroy on transcluded element
            clone.on('$destroy', function() {
              // Cleanup on aisle `transclude`
              delete cloneScope.$close;

              if (modal)
                scope.$close();
            });
          }
        });
      }
    };
  })
;

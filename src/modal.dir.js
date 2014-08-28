angular.module('modal')
  .directive('modal', function($rootScope, $compile, $document) {
    return {
      restrict: 'A',
      transclude: 'true',
      scope: {
        width: '&?',
        height: '&?',
        template: '&?',
        templateUrl: '&?',
        scope: '=?',
        controller: '&?'
      },
      template: '<div class="modal-focus">',
      require: 'modal',
      controllerAs: 'modal',
      controller: function($q) {
        var deferred = $q.defer();
        this.resolve = deferred.resolve;
        this.reject = deferred.reject;
        this.promise = deferred.promise;
      },
      link:  function(scope, el, attrs , ctrl, transclude) {
        var blur = angular.element(el.children()[0]);
        var body = $document.find('body');
        var modal = true;
        var service = attrs.hasOwnProperty('service');

        // TODO: Move this to the service
        body.children().addClass('modal-blur');
        var parent = el;
        while (parent.length) {
          parent.removeClass('modal-blur');
          parent = parent.parent();
        }

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
          if (e.target === blur) {
            $document.off('click', off);
            scope.$dismiss();
          }
        };
        $document.on('click', off);

        transclude(function transcludeModal(clone) {
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
        });
      }
    };
  })
;

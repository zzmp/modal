(function(angular) {

angular.module('modal', []);

angular.module('modal')
  .directive('modal', function() {
    return {
      restrict: 'EA',
      transclude: 'element',
      scope: {
        width: '&?',
        height: '&?'
      },
      template: '<div class="modal-blur">' +
        '<div class="modal-focus" ng-transclude>' +
        '</div></div>',
      controller: function($document) { this.document = $document; },
      link: function(scope, el, attrs, ctrl, transclude) {
        var deregister;

        // `.close` the modal
        scope.$close = function() {
          deregister();
          el.remove();
        };

        // Listen for `ESC`
        var deregister = ctrl.document.on('keypress', function(e) {
          if (e.keycode === 27)
            scope.$close();
        });

        $transclude(function transcludeModal(clone) {
          var cloneScope = clone.scope();

          // Expose `.close` to transcluded scope
          cloneScope.$close = scope.$close;

          // Listen for $destroy on transcluded element
          el.on('$destroy', function() {
            // Cleanup on aisle `transclude`
            delete cloneScope.$close;

            scope.$close();
          });
        });
      }
    };
  })
;

}(angular) );

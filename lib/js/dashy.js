
var app = angular.module('app', []);

app.controller('editor', function ($http,$scope) {
    $scope.schema = [];
    $scope.current = {};
    $scope.index = 1;

    $http.get('test.json').then(function(data){
        $scope.schema = data.data.map(patchSchema);
    });


    function patchSchema(s) {
        if(!s.$schema) s.$schema = "http://json-schema.org/draft-03/schema";
        if(!s.id) s.id = "obj"+$scope.index++;
        if(!s.type) s.type = "object";
        if(!s.required) s.required = false;
        return s;
    };

    $scope.loadSchema = function(s) {
        $scope.current = s;
    };

    $scope.getJSON = function() {
        return JSON.stringify(angular.copy($scope.current), null, 2);
    };

    $scope.newType = function() {
        var s = patchSchema({});
        console.log(s);
        $scope.schema.push(s);
        $scope.loadSchema(s);
    };
});

app.directive('ace', ['$timeout', function ($timeout) {

    var resizeEditor = function (editor, elem) {
        var lineHeight = editor.renderer.lineHeight;
        var rows = editor.getSession().getLength();
        //$(elem).height(rows * lineHeight);
        editor.resize();
    };

    return {
        restrict: 'A',
        require: '?ngModel',
        scope: true,
        link: function (scope, elem, attrs, ngModel) {
            var node = elem[0];

            var editor = ace.edit(node);
            editor.setTheme('ace/theme/monokai');
            editor.getSession().setMode('ace/mode/json');

            // set editor options
            editor.setShowPrintMargin(false);

            // data binding to ngModel
            ngModel.$render = function () {
                editor.setValue(ngModel.$viewValue);
                resizeEditor(editor, elem);
            };

            editor.on('change', function () {
                $timeout(function () {
                    scope.$apply(function () {
                        var value = editor.getValue();
                        ngModel.$setViewValue(value);
                    });
                });

                resizeEditor(editor, elem);
            });
        }
    };
}]);

app.directive("clickToEdit", function() {
    var editorTemplate = '<div class="click-to-edit">' +
        '<div ng-hide="view.editorEnabled">' +
            '{{value}} ' +
            '<a ng-click="enableEditor()">Edit</a>' +
        '</div>' +
        '<div ng-show="view.editorEnabled">' +
            '<input ng-model="view.editableValue">' +
            '<a href="#" ng-click="save()">Save</a>' +
            ' or ' +
            '<a ng-click="disableEditor()">cancel</a>.' +
        '</div>' +
    '</div>';

    return {
        restrict: "A",
        replace: true,
        template: editorTemplate,
        scope: {
            value: "=clickToEdit",
        },
        controller: function($scope) {
            $scope.view = {
                editableValue: $scope.value,
                editorEnabled: false
            };

            $scope.enableEditor = function() {
                $scope.view.editorEnabled = true;
                $scope.view.editableValue = $scope.value;
            };

            $scope.disableEditor = function() {
                $scope.view.editorEnabled = false;
            };

            $scope.save = function() {
                $scope.value = $scope.view.editableValue;
                $scope.disableEditor();
            };
        }
    };
});



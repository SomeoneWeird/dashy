function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function prettyJSON(json) {
    var json = syntaxHighlight(JSON.stringify(json, undefined, 4));
    return json;
}

var app = angular.module('app', [ 'xeditable' ]);

app.run(function(editableOptions) {
  editableOptions.theme = 'default';
});

app.controller('editor', function ($http,$scope) {

    $scope.schemaTypes = [

        { value: 'array',   text: "Array"   },
        { value: 'boolean', text: "Boolean" },
        { value: 'integer', text: "Integer" },
        { value: 'number',  text: "Number"  },
        { value: 'null',    text: "Null"    },
        { value: 'object',  text: "Object"  },
        { value: 'string',  text: "String"  }

    ]

    $scope.schema = [];
    $scope.currentSchema = {};
    $scope.index = 1;

    // $http.get('test.json').then(function(data) {

    //     $scope.schema = data.data.map(patchSchema);
    //     $scope.current = $scope.schema[0];

    // });

    $http.get('test2.json').then(function(data) {

        data = data.data;

        var schema = patchSchema(data);

        console.log(schema);

        $scope.schema.push(schema);

        $scope.currentSchema = $scope.schema[0];

    })

    function patchSchema(s) {

        if(!s) s = {};

        if(!s.$schema) s.$schema = "http://json-schema.org/draft-03/schema";
        if(!s.id) s.id = "obj" + $scope.index++;
        if(!s.type) s.type = "object";
        if(!s.required) s.required = false;

        return s;

    };

    $scope.loadSchema = function(s) {
        $scope.currentSchema = s;
    };

    $scope.getJSON = function() {
        return prettyJSON(JSON.parse(angular.toJson($scope.currentSchema)));
    };

    $scope.newSchema = function() {

        var schemaName = prompt("New schema name?");

        var s = patchSchema({
            id: schemaName
        });
        console.log(s);
        $scope.schema.push(s);
        $scope.loadSchema(s);
    };

    $scope.newAttribute = function() {

        var key = prompt('New key name?');

        if(!key) return;

        if(!$scope.currentSchema.properties) $scope.currentSchema.properties = {};

        $scope.currentSchema.properties[key] = {}

    }

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

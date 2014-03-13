pen.define([
    'common-ui/angular'
],

    function (angular) {
        var templatePath = "";
        if (typeof(CONTEXT_PATH) != "undefined") {
            templatePath = CONTEXT_PATH + 'content/common-ui/resources/web/angular-directives/folderBrowser/';
        } else {
            templatePath = 'angular-directives/folderBrowser/';
        }

        angular.module('folderBrowser', [])
            .directive('treecontrol', ['$compile', '$location', '$anchorScroll',
                function ($compile, $location, $anchorScroll) {
                    return {
                        restrict: 'EA',
                        require: "treecontrol",
                        transclude: true,
                        templateUrl: templatePath + 'folderBrowser.html',
                        scope: {
                            treeModel: "=",
                            extSelect: "=",
                            addFolder: "=",
                            selectedNode: "=",
                            onSelection: "&",
                            nodeChildren: "@"
                        },

                        controller: function ($scope) {

                            $scope.nodeChildren = $scope.nodeChildren || 'children';
                            $scope.expandedNodes = {};

                            $scope.headClass = function (node) {

                                if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && !$scope.expandedNodes[node.path])
                                    style = "tree-collapsed";
                                else if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && $scope.expandedNodes[node.path])
                                    style = "tree-expanded";
                                else
                                    style = "tree-collapsed";
                                return style;
                            };

                            $scope.selectorClass = function (node) {
                                var style = "";
                                if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0  && !$scope.expandedNodes[node.path])
                                    style = "arrow-collapsed";
                                else if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && $scope.expandedNodes[node.path])
                                    style = "arrow-expanded";
                                else
                                    style = "blank"
                                return style;
                            };

                            $scope.findNodeByAttr = function (attr, val) {

                                $scope.treeModel;
                                var foundNode = false;
                                var nodeWithAttr;
                                var rootChildren = $scope.treeModel.children;

                                recurseChildren = function (children) {
                                    if (foundNode == false) {

                                        for (var i = 0; i < children.length; i++) {

                                            if (children[i][attr] == val) {
                                                foundNode = true;
                                                nodeWithAttr = children[i];

                                            } else {
                                                if (children[i].children.length > 0) {

                                                    recurseChildren(children[i].children);

                                                }

                                            }
                                            if (foundNode == true) {
                                                break;
                                            }
                                        }
                                    }
                                }

                                recurseChildren(rootChildren);
                                return {
                                    node: nodeWithAttr
                                };

                            };

                            $scope.nodeExpanded = function (node) {
                                return $scope.expandedNodes[node.path];
                            };

                            $scope.expandParents = function (node) {
                                //clear existing selections
                                $scope.expandedNodes = [];
                                var path = node.path;

                                if (path) {
                                    //break down path and add each node id to expanded nodes
                                    while ((path.split("/").length - 1) > 1) {
                                        var index = path.lastIndexOf("/");
                                        //new path at previous level
                                        path = path.replace(path.substring(index, path.length), "");
                                        //set node to expanded
                                        $scope.expandedNodes[path] = true;
                                    }

                                    //add root folder to expanded nodes
                                    $scope.expandedNodes[path] = true;

                                }

                            };

                            $scope.selectNodeHead = function (node) {
                                $scope.expandedNodes[node.path] = !$scope.expandedNodes[node.path];
                            };

                            $scope.selectNodeHeadExt = function (node) {
                                if (!$scope.expandedNodes[node.path]) {
                                    $scope.expandedNodes[node.path] = true;
                                }
                            };

                            $scope.selectNodeLabel = function (selectedNode) {

                                $scope.selectedScope = selectedNode.path;
                                $scope.selectedNode = selectedNode;
                                if ($scope.onSelection)
                                    $scope.onSelection({
                                        node: selectedNode
                                    });

                            };

                            $scope.selectedClass = function (node) {

                                var style = ""
                                if($scope.selectedScope == node.path){
                                  angular.element(".tree-selected").removeClass('tree-selected');
                                  angular.element("#"+node.id).addClass("tree-selected");
                                  style="tree-selected";
                                if(node.path == $scope.extSelect.val){
                                  //Scroll to div
                                  var locationHash=$location.hash();
                                  if(locationHash != node.id){
                                  $location.hash(node.id);
                                  $anchorScroll();

                                  }
                                }

                                }

                                return style;
                            };

                            //tree template
                            var template =
                                '<ul class="treecontrol">' +
                                    '<li ng-repeat="node in node.' + $scope.nodeChildren + '" ng-class="headClass(node)">' +
                                    '<div id="{{node.id}}">' +
                                    '<span ng-class="selectorClass(node)" ng-click="selectNodeHead(node)"></span>' +
                                    '<i class="tree-has-children" ng-click="selectNodeLabel(node)" ng-dblclick="selectNodeHead(node)"></i>' +
                                    '<i class="tree-normal"></i>' +
                                    '<div class="tree-label" ng-class="selectedClass(node)" ng-click="selectNodeLabel(node)" ng-dblclick="selectNodeHead(node)" tree-transclude></div>' +
                                    '</div>' +
                                    '<treeitem ng-if="nodeExpanded(node)"></treeitem>' +
                                    '</li>' +
                                    '</ul>';

                            return {
                                templateRoot: $compile(template),
                                templateChild: $compile(template)
                            }

                        },

                        compile: function (element, attrs, childTranscludeFn) {
                            return function (scope, element, attrs, treemodelCntr) {

                                function updateNodeOnRootScope(newValue) {
                                    if (angular.isArray(newValue)) {
                                        scope.node = {};
                                        scope.node[scope.nodeChildren] = newValue;
                                    } else {
                                        scope.node = newValue;
                                    }
                                }

                                function extSelectEvent() {
                                    if (scope.extSelect) {
                                        var obj = scope.findNodeByAttr(scope.extSelect.attr, scope.extSelect.val);
                                        scope.selectedNode = obj.node;
                                        scope.expandParents(scope.selectedNode);
                                        scope.selectNodeHeadExt(scope.selectedNode);
                                        scope.selectNodeLabel(scope.selectedNode);
                                    }
                                }


                                function addFolderEvent() {
                                    //make sure that addFolder is populated and we have a node selected
                                    if (scope.addFolder && scope.selectedNode) {

                                        var nodePath="";
                                        if(scope.addFolder.path){
                                          nodePath = scope.addFolder.path;
                                        }
                                        else{
                                          nodePath=scope.selectedNode.path + "/" + scope.addFolder.name;
                                        }

                                        var newFolder =
                                        {
                                          id: scope.addFolder.id,
                                          name: scope.addFolder.name,
                                          localizedName:scope.addFolder.name,
                                          isFolder: true,
                                          path: nodePath,
                                          children:scope.addFolder.children
                                        }
                                        //push new folder onto root of current selection
                                        scope.selectedNode.children.push(newFolder);

                                        //select new folder
                                        scope.selectedNode = newFolder;
                                        scope.expandParents(scope.selectedNode);
                                        scope.selectNodeHeadExt(scope.selectedNode);
                                        scope.selectNodeLabel(scope.selectedNode);
                                    }
                                }

                                scope.$watch("treeModel", updateNodeOnRootScope);
                                updateNodeOnRootScope(scope.treeModel);

                                scope.$watch("extSelect", extSelectEvent);

                                scope.$watch("addFolder", addFolderEvent);

                                //Rendering template for a root node
                                treemodelCntr.templateRoot(scope, function (clone) {
                                    element.html('').append(clone);
                                });
                                // save the transclude function from compile (which is not bound to a scope as apposed to the one from link)
                                // we can fix this to work with the link transclude function with angular 1.2.6. as for angular 1.2.0 we need
                                // to keep using the compile function
                                scope.$treeTransclude = childTranscludeFn;
                            }
                        }
                    };
                }
            ])
            .directive("treeitem", function () {
                return {
                    restrict: 'E',
                    require: "^treecontrol",
                    link: function (scope, element, attrs, treemodelCntr) {

                        // Rendering template for the current node
                        treemodelCntr.templateChild(scope, function (clone) {
                            element.html('').append(clone);
                        });
                    }
                }
            })
            .directive("treeTransclude", function () {
                return {
                    link: function (scope, element, attrs, controller) {
                        scope.$treeTransclude(scope, function (clone) {
                            element.empty();
                            element.append(clone);
                        });
                    }
                }
            });

    });
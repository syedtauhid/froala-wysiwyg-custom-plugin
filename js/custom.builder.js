/**
 * @param {*} editorId 
 * @param {*} toolbarButtons 
 * @param {*} pluginsEnabled 
 * @param {*} apiUrl 
 */
var CustomFroalaEditorBuilder = function(editorId, toolbarButtons, pluginsEnabled, apiUrl) {
    this.editorId = editorId;
    this.toolbarButtons = toolbarButtons;
    this.pluginsEnabled = pluginsEnabled;
    this.apiUrl = apiUrl;
    this.optionList = {};
    this.handlebarTemplate = "";

    // Temp Variables
    var checkboxContainerId = "#table-content-checkbox";
    var sortBycheckboxContainerID = "#sortby-checkbox-group";
    var submitButtonId = "#submit-table-data";
    var modalId = "#checkboxModal";
    var modalTitleId = modalId + " .modal-title";

    // Define Custon Dropdown
    var defineCustomDropdown = function () {
        $.FroalaEditor.DefineIcon('custom_dropdown', {NAME: 'cog'});
        $.FroalaEditor.RegisterCommand('custom_dropdown', {
          title: 'Advanced options',
          type: 'dropdown',
          focus: false,
          undo: true,
          refreshAfterCallback: true,
          options: this.optionList,
          callback: function (cmd, val) {
              insertElementInEditor(this, val);
          }
        });
        this.toolbarButtons.push('custom_dropdown');
    }
    
    // Register Custom Commands
    var registerCustomCommands = function(item) {
        var val = "<i class='fa fa-" + item.iconName + "'></i> " + item.name;
        var key =  item.id;
        this.optionList[key] = val;
    }
    
    // Insert the custom element in Editor
    var insertElementInEditor = function(editor, type) {
        var data = getTableDataBasedOnType(type);
        showModalAndInsertTable(editor, data, type);
    }

    var showModalAndInsertTable = function(editor, data, type) {
        var contents = prepareCheckboxContents(data);
        var checkboxFields = prepareCheckboxFields(contents);

        $(checkboxContainerId).html(checkboxFields);
        prepareAndShowShortbyCheckboxes();

        //show modal
        var modal = $(modalId).modal({backdrop: "static", keyboard: false});
        $(modalTitleId).html(type);
        $(submitButtonId).on('click', function(){
            var columns = getAllSelectedCheckboxList(checkboxContainerId);
            var sortBy = getAllSelectedCheckboxList(sortBycheckboxContainerID);
            var scope = gellScopeFromSelection(columns, data);
            var template = prepareTemplateWithData(type, scope, columns, sortBy);
            console.log(template);
            editor.html.insert(template);
            editor.undo.saveStep();
            addEventListenerForEdit(template);
            $(modalId).modal('hide');
            $(this).prop('onclick',null).off('click');
        });
        modal.show();
    }

    var showModalAndUpdateTable = function(type, jsonData, selectedColumns, selectedSortby, $element) {
        var contents = prepareCheckboxContents(jsonData);
        var checkboxFields = prepareCheckboxFields(contents);

        $(checkboxContainerId).html(checkboxFields);
        prepareAndShowShortbyCheckboxes(selectedSortby);
        
        //Resoring previous data
        $.each(selectedColumns, function(index, val) {
            $(checkboxContainerId + ' input[value="'+ val +'"]').prop('checked', true);
        });

        $(checkboxContainerId + ' input:checkbox').trigger("change");
        //show modal
        var modal = $(modalId).modal({backdrop: "static", keyboard: false});
        $(modalTitleId).html(type);
        $(submitButtonId).on('click', function(){
            var columns = getAllSelectedCheckboxList(checkboxContainerId);
            var sortBy = getAllSelectedCheckboxList(sortBycheckboxContainerID);
            var scope = gellScopeFromSelection(columns, jsonData);
            $element.attr("scope", scope);
            $element.attr("columns", columns);
            $element.attr("sortBy", sortBy);
            $(modalId).modal('hide');
        });
        modal.show();
    }

    var prepareCheckboxContents = function(data) {
        var contents = [];
        $.each(data, function(key, value){
            if(data[key].schema) {
                var fieldsArray = {};
                fieldsArray["path"] =  key + ".schema.";
                fieldsArray[key] = [];
                $.each(data[key].schema, function(fieldsKey, fieldsValue){
                    fieldsArray[key].push(fieldsKey);
                });
                contents.push(fieldsArray)
            } else {
                contents.push(key);
            }
        });

        return contents;
    }

    var prepareCheckboxFields = function(contents) {
        var checkboxFields= [];
        $.each(contents, function (index, content) {
            var checkboxField;
            if(typeof(content) === "object"){
                var path;
                $.each(content, function(key, objVal){
                    if(key == "path") {
                        path = objVal;
                        return;
                    }
                    checkboxField = '<div class="checkbox-group"> <span class="title">'+ key + ':' +'</span>';
                    $.each(objVal, function(index, val){
                        checkboxField = checkboxField + getCheckboxElem("$." + path + val , val);
                    });
                });
                checkboxField = checkboxField + '</div>';
            } else {
                checkboxField = getCheckboxElem("$." + content, content);
            }
            checkboxFields.push(checkboxField);
        });

        return checkboxFields;
    }

    var prepareAndShowShortbyCheckboxes = function(preSelectedValues) {
        $(sortBycheckboxContainerID).html("");
        $(checkboxContainerId + ' input:checkbox').on('change', function(){
            var checkboxFields = [];
            var currentlyChosenValues = preSelectedValues ? preSelectedValues : [];
            $(sortBycheckboxContainerID + ' input:checked').each(function(){
                currentlyChosenValues.push(this.value);
            });
            $(checkboxContainerId + ' input:checked').each(function() {
                var value = this.value;
                var path = value;

                if(path.indexOf('.') > -1) {
                    value = path.split(".");
                    value = value[value.length - 1];
                }
                checkboxField = getCheckboxElem(path, value);
                checkboxFields.push(checkboxField);
            });

            $(sortBycheckboxContainerID).html(checkboxFields);
            $.each(currentlyChosenValues, function(index, val){
                $(sortBycheckboxContainerID + ' input[value="'+ val +'"]').prop('checked', true);
            });
        });
    }

    var addEventListenerForEdit = function() {
        $(this.editorId + " a.table-data").on('click', function(){
            var $parent = $(this).parent();
            var columnList = $parent.attr("columns").split(",");
            var sortbyList = $parent.attr("sortBy").split(",");
            var type = $parent.attr("fqn");
            var jsonData = getTableDataBasedOnType(type);

            showModalAndUpdateTable(type, jsonData, columnList, sortbyList, $parent);
        });
    }

    var getAllSelectedCheckboxList = function(containerId) {
        var values = "";
        $(containerId + ' input:checked').each(function() {
            values += this.value + ",";
        });
        return values.replace(/.$/,"");
    }

    var gellScopeFromSelection = function(columns, data){
        var scope = "";
        columns = columns.replace(new RegExp("\\$.","gm"), "")
        var columnList = columns.split(",");
        $.each(columnList, function(index, val){
            if(data[val] && data[val].linkScope)
                scope += data[val].linkScope + ",";
        });

        return scope.replace(/.$/,"");
    }

    var prepareTemplateWithData = function(type, scope, columns, sortBy) {
        var template = this.handlebarTemplate;
        template = template.replace(/{{type}}/g, type);
        template = template.replace(/{{scope}}/g, scope);
        template = template.replace(/{{columns}}/g, columns);
        template = template.replace(/{{sortBy}}/g, sortBy);

        return template;
    }

    var getCheckboxElem = function(val, label) {
        return '<div class="checkbox">' + '<label><input type="checkbox" value="'+ val +'">'+ label +'</label>' + "</div>";
    }
    
    // Initialize the editor.
    var initFroalaEditor = function () {
        defineCustomDropdown();
        $(this.editorId).froalaEditor({
          toolbarButtons: this.toolbarButtons,
          pluginsEnabled: this.pluginsEnabled,
          htmlAllowedEmptyTags: [
            "a",
            "bcv-output",
            "bcv-resources"
          ],
          htmlAllowedTags: ["bcv-resources", "a"],
          htmlAllowedAttrs: [".*"],
          htmlRemoveTags: ["script"]
        });
    }

    //For API call use Synchronous call. jQuery.ajaxSetup({async:false});
    var getTableDataBasedOnType = function(type) {
        if(!jsonData)
            alert("define jsonData. See readme...");
        return jsonData;
    }

    var getHandlebarTemplate = function() {
        setHandlebarTemplate(defaultHandlebarTemplate);
    }

    var setHandlebarTemplate = function(data) {
        this.handlebarTemplate = data;
    }

    var getEditorHTML = function(){
        return $(editorId).froalaEditor('html.get');
    }
    
    // Fetch Custom Buttons Data 
    var getEditorCustomOptions = function() {
        $.getJSON(this.apiUrl, function (data) {
            var classList = data._embedded.componentDefinitionOutputClassList;
            $.each(classList, function (index, classItem) {
                registerCustomCommands(classItem);
            });
            initFroalaEditor();
        }, function(err){console.log(err)});
    }

    var init = function(){
        getEditorCustomOptions();
        getHandlebarTemplate();
    }
    
    return {
        init : init,
        getEditorHTML : getEditorHTML
    }

}

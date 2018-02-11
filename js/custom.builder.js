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
        var checkboxContainerId = "#table-content-checkbox";
        var contents = prepareCheckboxContents(data);
        var checkboxFields = prepareCheckboxFields(contents);

        $(checkboxContainerId).html(checkboxFields);

        prepareAndShowShortbyCheckboxes(checkboxContainerId);

        //show modal
        var modal = $("#checkboxModal").modal({backdrop: "static", keyboard: false});
        $("#checkboxModal .modal-title").html(type);
        var template = this.handlebarTemplate;
        $('#submit-table-data').on('click', function(){
            
            editor.html.insert(template);
            editor.undo.saveStep();
            $("#checkboxModal").modal('hide');
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
                    console.log(key);
                    if(key == "path") {
                        path = objVal;
                        return;
                    }
                    checkboxField = '<div class="checkbox-group"> <span class="title">'+ key + ':' +'</span>';
                    $.each(objVal,function(index, val){
                        checkboxField = checkboxField + getCheckboxElem(path + val , val);
                    });
                });
                checkboxField = checkboxField + '</div>';
            } else {
                checkboxField = getCheckboxElem(content, content);
            }
            checkboxFields.push(checkboxField);
        });

        return checkboxFields;
    }

    var prepareAndShowShortbyCheckboxes = function(checkboxContainerId) {
        var sortBycheckboxContainerID = "#sortby-checkbox-group";
        $(sortBycheckboxContainerID).html("");
        $(checkboxContainerId + ' input:checkbox').on('click', function(){
            var checkboxFields = [];
            var currentlyChosenValues = [];
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
            "bcv-output",
            "bcv-resources"
          ],
          htmlAllowedTags: ["bcv-resources"],
          htmlAllowedAttrs: [".*"],
          htmlRemoveTags: ["script"]
        });
    }

    var getTableDataBasedOnType = function(type) {
        if(!jsonData)
            alert("define jsonData. See readme...");
        return jsonData;
    }

    var getHandlebarTemplate = function() {
        $.get( "template.html", function( data ) {
             setHandlebarTemplate(data);
        });
    }

    var setHandlebarTemplate = function(data) {
        this.handlebarTemplate = data;
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
        init : init
    }

}

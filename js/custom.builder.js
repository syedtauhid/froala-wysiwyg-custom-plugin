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
    this.contentByTypeTemplate = "";
    this.contentByTemplate = "";

    // Temp Variables
    var checkboxContainerId = "#table-content-checkbox";
    var sortBycheckboxContainerID = "#sortby-checkbox-group";
    var submitButtonId = "#submit-table-data";
    var modalId = "#checkboxModal";
    var modalTitleId = modalId + " .modal-title";
    var selectionModalId = "#selectionModal";
    var selectInsertTypeId = selectionModalId + " select#selectInsertType";
    var selectContentTypeId = selectionModalId + " select#selectContentType";
    var selectTypeContainerId = selectionModalId + " #choose-types";
    var submitInsertTypeBtnId = selectionModalId + " #submit-insert-type";

    var checkboxContainerClass = ".checkbox-container"
    var ratioBtnContainerClass = ".ratio-group-container";
    var selectTemplateContainerId = ratioBtnContainerClass + " #select-template-ratio";

    // Define Custon Dropdown
    var defineCustomDropdown = function () {
        $.FroalaEditor.DefineIcon('custom_dropdown', {NAME: 'angle-double-down'});
        $.FroalaEditor.RegisterCommand('custom_dropdown', {
          title: 'Insert BCV Content',
          type: 'dropdown',
          focus: true,
          undo: true,
          refreshAfterCallback: true,
          options: this.optionList,
          callback: function (cmd, val) {
              this.selection.save();
              insertElementInEditor(this, val);
          }
        });
        this.toolbarButtons.push('custom_dropdown');
    }

    var defineCustomButton = function() {
        $.FroalaEditor.DefineIcon('insert_BCV', {NAME: 'plus-square'});
        $.FroalaEditor.RegisterCommand('insert_BCV', {
            title: 'Insert BCV Content',
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                this.selection.save();
                openSelectionModal(this);
            }
        });
        this.toolbarButtons.push('insert_BCV');
    }
    
    /***** DATA  ******/
    var jsonContentType = {
        "_embedded": {
            "componentDefinitionOutputClassList": [
                {
                    "id": "com.bcv.bcm.bia.out.ApplicationDep",
                    "name": "ApplicationDep",
                    "iconName": "share-alt",
                    "description": "com.bcv.bcm.bia.out.ApplicationDep.meta.description",
                    "category": "component.out.category.dynamic",
                    "template": "/extensions/com/bcv/bcm/bia/templates/application-dependencies.hbs",
                    "query": {},
                    "allowMultiple": false,
                    "hasHeader": true,
                    "component_definition": "com.bcv.bcm.bia"
                },
                {
                    "id": "com.bcv.bcm.bia.out.Content",
                    "name": "Content",
                    "iconName": "font",
                    "description": "com.bcv.bcm.bia.out.Content.meta.description",
                    "category": "component.out.category.content",
                    "template": "/extensions/com/bcv/bcm/common/templates/content.hbs",
                    "query": {},
                    "allowMultiple": true,
                    "hasHeader": false,
                    "component_definition": "com.bcv.bcm.bia"
                },
                {
                    "id": "com.bcv.bcm.bia.out.CriticalVendorDep",
                    "name": "CriticalVendorDep",
                    "iconName": "truck",
                    "description": "com.bcv.bcm.bia.out.CriticalVendorDep.meta.description",
                    "category": "component.out.category.dynamic",
                    "template": "/extensions/com/bcv/bcm/bia/templates/critical-vendor-dependencies.hbs",
                    "query": {},
                    "allowMultiple": false,
                    "hasHeader": true,
                    "component_definition": "com.bcv.bcm.bia"
                }
            ]
        }
    };

    var openSelectionModal = function(editor) {
        let modal = $(selectionModalId).modal({backdrop: "static", keyboard: false});
        $(selectInsertTypeId).change(function(){
            if(this.value == 0){
                prepareAndAddTypeList();
                $(selectTypeContainerId).removeClass('hidden');
                if($(selectContentTypeId).val() != "none")
                    $(submitInsertTypeBtnId).prop('disabled', false);
            } else if(this.value == 1) {
                $(submitInsertTypeBtnId).prop('disabled', false);
                $(selectTypeContainerId).addClass('hidden');
            } else {
                $(submitInsertTypeBtnId).prop('disabled', true);
            }

        });

        //adding action to submit button
        $(submitInsertTypeBtnId).click(function(){
            $(selectionModalId).modal('hide');
            let insertType = $(selectInsertTypeId).val();
            if(insertType == 0) {
                let type = $(selectContentTypeId).val();
                insertElementInEditor(editor, type);
            } else {
                showModalForChoosingTemplate(editor);
            }
            $(this).prop('onclick',null).off('click');
        });
        
    }

    var prepareAndAddTypeList = function() {
        if($(selectContentTypeId + " option").length > 1) return;

        var types = getTypeList();
        $.each(types, function (i, item) {
            var text = item.name;
            var value =  item.id;
            $(selectContentTypeId).append($('<option>', { 
                value: value,
                text : text 
            }));
        });
        $(selectContentTypeId).change(function(){
            if(this.value != "none")
                $(submitInsertTypeBtnId).prop('disabled', false);
        });
    }

    var getTypeList = function() {
        var classList = jsonContentType._embedded.componentDefinitionOutputClassList;
        return classList;
    }

    // Using the same json for template list
    var prepareTemplateListContents = function() {
        return getTypeList();
    }

    var showModalForChoosingTemplate = function(editor, selectedVal, $element){
        $(checkboxContainerClass).addClass("hidden");
        $(ratioBtnContainerClass).removeClass("hidden");

        var contents = prepareTemplateListContents();
        var checkboxFields = prepareRationBtnFields(contents);

        $(selectTemplateContainerId).html(checkboxFields);
        $(selectTemplateContainerId + " input:radio").change(function(){
            $(submitButtonId).prop('disabled', false);
        });
        if(selectedVal)
            $(selectTemplateContainerId + ' input[value="'+ selectedVal +'"]').prop('checked', true);

        //show modal
        let modal = $(modalId).modal({backdrop: "static", keyboard: false});
        $(modalTitleId).html("Select Template Ids");
        modal.show();

        $(submitButtonId).click(function(){
            let id =  $(selectTemplateContainerId + ' input:checked').val();
            if(selectedVal) {
                $element.parent().attr('dataId', id);
                $element.html('BCV template: ' + id);
            } else {
                let template = prepareHtmlForInsertTemplate(id);
                editor.selection.restore();
                editor.html.insert(template);
                editor.undo.saveStep();
                addEventListenerForEdit();
            }
            $(modalId).modal('hide');
            $(this).prop('onclick',null).off('click');
        });

        modal.on('hidden.bs.modal', function(){
            $(ratioBtnContainerClass).addClass("hidden");
            $(checkboxContainerClass).removeClass("hidden");
        });
    }

    var prepareHtmlForInsertTemplate = function(id) {
        let template = this.contentByTemplate;
        template = template.replace(/{{id}}/g, id);
        return template;
    }

    var prepareRationBtnFields = function(contents) {
        var fields = [];
        $.each(contents, function (i, item) {
           let elem = getRadioElem(item.id, item.name);
           fields.push(elem);
        });
        return fields;
    }
    
    // Insert the custom element in Editor
    var insertElementInEditor = function(editor, type) {
        var data = getTableDataBasedOnType(type);
        showModalAndInsertTable(editor, data, type);
    }

    //show modal for insert
    var showModalAndInsertTable = function(editor, data, type) {
        var contents = prepareCheckboxContents(data);
        var checkboxFields = prepareCheckboxFields(contents);

        $(checkboxContainerId).html(checkboxFields);
        prepareAndShowShortbyCheckboxes();

        //show modal
        let modal = $(modalId).modal({backdrop: "static", keyboard: false});
        $(modalTitleId).html(type);
        modal.show();

        //Set submit button action
        $(submitButtonId).on('click', function(){
            var columns = getAllSelectedCheckboxList(checkboxContainerId);
            var sortBy = getAllSelectedCheckboxList(sortBycheckboxContainerID);
            var scope = gellScopeFromSelection(columns, data);
            var template = prepareTemplateWithData(type, scope, columns, sortBy);
            editor.selection.restore();
            editor.html.insert(template);
            editor.undo.saveStep();
            addEventListenerForEdit();
            $(modalId).modal('hide');
        });
        modal.on('hidden.bs.modal', function () {
            disposeAllActions();
        });
    }

    // show modal for update
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
        modal.show();

        $(submitButtonId).on('click', function(){
            var columns = getAllSelectedCheckboxList(checkboxContainerId);
            var sortBy = getAllSelectedCheckboxList(sortBycheckboxContainerID);
            var scope = gellScopeFromSelection(columns, jsonData);
            $element.attr("scope", scope);
            $element.attr("columns", columns);
            $element.attr("sortBy", sortBy);
            $(modalId).modal('hide');
        });

        modal.on('hidden.bs.modal', function () {
            disposeAllActions();
        });
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
        $(checkboxContainerId).html("");
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
            var $columnSelected= $(checkboxContainerId + ' input:checked');
            $columnSelected.each(function() {
                var value = this.value;
                var path = value;

                if(path.indexOf('.') > -1) {
                    value = path.split(".");
                    value = value[value.length - 1];
                }
                checkboxField = getRadioElem(path, value);
                checkboxFields.push(checkboxField);
            });

            $(sortBycheckboxContainerID).html(checkboxFields);
            $.each(currentlyChosenValues, function(index, val){
                $(sortBycheckboxContainerID + ' input[value="'+ val +'"]').prop('checked', true);
            });
            $columnSelected.length ? $(submitButtonId).prop('disabled', false) : $(submitButtonId).prop('disabled', true);
        });
    }

    var addEventListenerForEdit = function() {
        $(this.editorId + " a.table-data").click(function(){
            var $elem = $(this).parent();
            //var $elem = $parent.find("bcv-resources" );
            if($elem.attr('dataId')) {
                let id = $elem.attr('dataId');
                showModalForChoosingTemplate(null, id, $(this));
            } else {
                var columnList = $elem.attr("columns").split(",");
                var sortbyList = $elem.attr("sortBy").split(",");
                var type = $elem.attr("fqn");
                var jsonData = getTableDataBasedOnType(type);

                showModalAndUpdateTable(type, jsonData, columnList, sortbyList, $elem);
            }
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
        var template = this.contentByTypeTemplate;
        template = template.replace(/{{type}}/g, type);
        template = template.replace(/{{scope}}/g, scope);
        template = template.replace(/{{columns}}/g, columns);
        template = template.replace(/{{sortBy}}/g, sortBy);

        return template;
    }

    var disposeAllActions = function() {
        $(checkboxContainerId + ' input:checkbox').prop('change', null).off('change');
        $(submitButtonId).prop('onclick',null).off('click');
        $(submitButtonId).prop('disabled', true);
    }

    var getCheckboxElem = function(val, label) {
        return '<div class="checkbox">' + '<label><input type="checkbox" value="'+ val +'">'+ label +'</label>' + "</div>";
    }

    var getRadioElem = function(val, label) {
        return '<div class="radio">' + '<label><input type="radio" name="sortby" value="'+ val +'">'+ label +'</label>' + "</div>";
    }
    
    // Initialize the editor.
    var initFroalaEditor = function () {
        // defineCustomDropdown();
        defineCustomButton();
        $(this.editorId).froalaEditor({
          toolbarButtons: this.toolbarButtons,
        //pluginsEnabled: this.pluginsEnabled,
          htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'object', 'video', 'style', '.fa', 'span', 'p', 'path', 'line',
                                       'h1', 'h2', 'h3', 'h4','bcv-output','bcv-resources','bcv-template'],
          htmlAllowedTags: [".*"],
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
        setContentByTypeTemplate(defaultContentByTypeTemplate);
        setContentByTemplate(defaultContentByTempale);
    }

    var setContentByTypeTemplate = function(data) {
        this.contentByTypeTemplate = data;
    }

    var setContentByTemplate = function(data){
        this.contentByTemplate = data;
    } 

    var getEditorHTML = function(){
        return $(editorId).froalaEditor('html.get');
    }

    // Register Custom Commands
    var registerCustomCommands = function(item) {
        var val = "<i class='fa fa-" + item.iconName + "'></i> " + item.name;
        var key =  item.id;
        this.optionList[key] = val;
    }
    
    // Fetch Custom Buttons Data 
  /**
     var getEditorCustomOptions = function() {
        $.getJSON(this.apiUrl, function (data) {
            var classList = data._embedded.componentDefinitionOutputClassList;
            $.each(classList, function (index, classItem) {
                registerCustomCommands(classItem);
            });
            initFroalaEditor();
        }, function(err){console.log(err)});
    }
    **/
  
     // Fetch Custom Buttons Data - From String "jsonContentType"
    var getEditorCustomOptions = function() {
            var classList = jsonContentType._embedded.componentDefinitionOutputClassList;
            $.each(classList, function (index, classItem) {
            //  console.log(classItem);
                registerCustomCommands(classItem);
            });
            initFroalaEditor();
    }
    
    var init = function(){
        // getEditorCustomOptions();
        initFroalaEditor();
        getHandlebarTemplate();
    }
    
    return {
        init : init,
        getEditorHTML : getEditorHTML
    }

}

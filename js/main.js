//For test Perpose. 
var jsonData = {
    "function": {
      "type": "link",
      "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.function",
      "helpText": "com.bconview.bcm.bia.CriticalVendorDep.fld.function.help",
      "linkLabel": "com.bconview.bcm.bia.CriticalVendorDep.lnk.requiredFor",
      "resourceType": "com.bconview.bcm.bia.EssentialFunction",
      "linkScope": "WS_ONLY",
      "component": "com.bconview.bcm.bia",
      "required": true
    },
    "vendor": {
      "type": "link",
      "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.vendor",
      "helpText": "com.bconview.bcm.bia.CriticalVendorDep.fld.vendor.help",
      "linkLabel": "critical",
      "component": "com.bconview.bcm.catalog",
      "resourceType": "com.bconview.bcm.catalog.Vendor",
      "linkScope": "WS_AND_HIERARCHY",
      "allowEventPropagation": "CONTENT_STATUS_CHANGE",
      "creatable": true,
      "required": false
    },
    "offer": {
      "type": "text",
      "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.offer",
      "helpText": "com.bconview.bcm.bia.CriticalVendorDep.fld.offer.help",
      "required": true
    },
    "contacts": {
      "type": "embedded_list",
      "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts",
      "helpText": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts.help",
      "template": "{{ fullName }}",
      "required": false,
      "schema": {
        "fullName": {
          "type": "text",
          "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts.fullName",
          "required": true
        },
        "phoneNos": {
          "type": "text_list",
          "required": false,
          "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts.phoneNos",
          "helpText": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts.phoneNos.help"
        },
        "emails": {
          "type": "email",
          "required": false,
          "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts.email",
          "helpText": "com.bconview.bcm.bia.CriticalVendorDep.fld.contacts.email.help"
        }
      }
    },
    "notes": {
      "type": "text",
      "label": "com.bconview.bcm.bia.CriticalVendorDep.fld.notes"
    }
  };


//for test purpose Handlebar Template 
var defaultContentByTypeTemplate =
  '<bcv-resources fqn="{{type}}" scope="{{scope}}" columns="{{columns}}" sortBy="{{sortBy}}" contenteditable="false">' +
  '<a class="table-data"> BCV Content: {{type}} </a> </bcv-resources><br />';

var defaultContentByTempale = '<bcv-template dataId="{{id}}"> <a class="table-data"> BCV template: {{id}} </a> </bcv-template>';

//CustomFroalaEditorBuilder object
var customFroalaEditorBuilder;

//Get the html and open the preview modal
function openPreviewModal() {  
  var html = customFroalaEditorBuilder.getEditorHTML();
  $('#preview-handlebars-temp textarea').val(html);
  $("#previewModal").modal('show');
}

$(function () {
    customFroalaEditorBuilder = CustomFroalaEditorBuilder("#froala-editor", ['bold','html'], ['codeView'], "/data.json");
    customFroalaEditorBuilder.init();
})

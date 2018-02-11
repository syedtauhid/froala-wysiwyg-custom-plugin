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

var customFroalaEditorBuilder;
//for test purpose Handlebar Template 
function openPreviewModal() {
  var html = $('div#froala-editor').froalaEditor('html.get');
  // html = html.replace(/&lt;/g, "<");
  // html = html.replace(/&gt;/g, ">");
  var template = Handlebars.compile(html);
  html = template(jsonData);
  console.log(html);
}

$(function () {
    customFroalaEditorBuilder = CustomFroalaEditorBuilder("#froala-editor", ['bold','html'], ['codeView'], "/data.json");
    customFroalaEditorBuilder.init();
})

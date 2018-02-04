# froala-wysiwyg-custom-plugin
Add `custom.builder.js` in your HTML page. Now initialize the `CustomFroalaEditorBuilder` with `editorId`, `toolbarButtons`, `pluginsEnabled`, `apiUrl`
Example : 
```shell
    CustomFroalaEditorBuilder("#froala-editor", ['bold', 'italic'], [], "/data.json").init();
```
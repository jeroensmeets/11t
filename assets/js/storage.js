function storagelib() {

  Storage.read(SAVENAME).then(function(content) {
      var data = JSON.parse(content);
      welcomeText.value = "Stored data: "  + data.message;
  }, function(error) {
      //For now, let's expect the error to be because of the file not being found.
      welcomeText.value = "There is currently no local data stored";
  });

  function saveMessage() {
      var storeObject = {message: message.value};
      Storage.write(SAVENAME, JSON.stringify(storeObject));
      hasStored.value = true;
  }

}

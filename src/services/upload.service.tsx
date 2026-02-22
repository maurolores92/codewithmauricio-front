import apiConnector from  './api.service';


export const upload = async (url: string, file: any, inputName = "file") => {
  const formData = new FormData();

  formData.append(inputName, file);
  
return await apiConnector.sendFile(url, formData);
};

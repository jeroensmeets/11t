// https://github.com/englekk/Fusetools_ImageUploadSample

using Uno;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.Threading;
using Uno.Net.Http;
using Uno.IO;
using Uno.Text;
using Uno.Collections;

public class Uploader : NativeModule
{
    public Uploader()
    {
        AddMember(new NativePromise<string, string>("send", (FutureFactory<string>)send, null));
    }

    static Future<string> send(object[] args)
    {
        debug_log "uploader started";
        // file path
        var path = (string)args[0];
        debug_log "path: " + path;

        // uri where the image should be uploaded
        var uri = (string)args[1];
        debug_log "uri: " + uri;

        var accesstoken = (string)args[2];
        debug_log "access token: " + accesstoken;

        var fileName = Path.GetFileName(path);
        debug_log fileName;
        var fileExt = Path.GetExtension(path).ToLower();
        debug_log fileExt;

        var imageData = Uno.IO.File.ReadAllBytes(path);
        var fileType = "image/png";
        if (fileExt == ".jpg" || fileExt == ".jpeg")
        {
          fileType = "image/jpeg";
        }
        else if (fileExt == ".gif")
        {
          fileType = "image/gif";
        }
        debug_log fileType;
        debug_log "all details listed";

        Dictionary<string, string> headers = new Dictionary<string, string>();
        // add any custom headers needed by your API
        headers.Add( "Authorization", "Bearer " + accesstoken );

        Dictionary<string, object> postParameters = new Dictionary<string, object>();
        postParameters.Add("filename", fileName);
        postParameters.Add("fileformat", fileExt);
        postParameters.Add("file", new FormUpload.FileParameter(imageData, fileName, fileType));

        // if there are multiple files, then simply add multiple post parameters. I didn't test it though, but it should work.

        byte[] formData = null;
        var request = FormUpload.MultipartFormDataPost(uri, "POST", headers, postParameters, out formData);

        debug_log "request created";

        var promise = new Promise<string>();
        new ResultClosure(promise, request);
        debug_log "about to send async request";
        request.SendAsync(formData);

        return promise;
    }

    class ResultClosure
    {
        Promise<string> _promise;

        public ResultClosure(Promise<string> promise, HttpMessageHandlerRequest request) {

            _promise = promise;

            request.Done += Done;
            request.Aborted += Aborted;
            request.Error += Error;
            request.Timeout += Timeout;
        }

        void Done(HttpMessageHandlerRequest r) {
          debug_log "Done in uno file: status " + r.GetResponseStatus();
          _promise.Resolve(r.GetResponseContentString());
        }

        void Error(HttpMessageHandlerRequest r, string message) {
          debug_log "Error: " + message;
          _promise.Reject(new Exception(message));
        }

        void Aborted(HttpMessageHandlerRequest r) { _promise.Reject(new Exception("Aborted")); }

        void Timeout(HttpMessageHandlerRequest r) { _promise.Reject(new Exception("Timeout")); }
    }
}

// Implements multipart/form-data POST in C# http://www.ietf.org/rfc/rfc2388.txt
// http://www.briangrinstead.com/blog/multipart-form-post-in-c
// Following code is a modification from the code posted at the above URL.
public static class FormUpload
{
    private static readonly Encoding encoding = Encoding.UTF8;
    public static HttpMessageHandlerRequest MultipartFormDataPost(string postUrl, string postMethod, Dictionary<string,string> headers, Dictionary<string, object> postParameters, out byte[] formData)
    {
        string formDataBoundary = String.Format("----------{0:N}", DateTime.Now.TickOfDay.ToString());
        string contentType = "multipart/form-data; boundary=" + formDataBoundary;
        debug_log "about to request multipart data";
        formData = GetMultipartFormData(postParameters, formDataBoundary);
        debug_log "multi-part data received";
        return PostForm(postUrl, postMethod, contentType, headers, formData);
    }
    private static HttpMessageHandlerRequest PostForm(string postUrl, string postMethod, string contentType, Dictionary<string,string> headers, byte[] formData)
    {
        var client = new HttpMessageHandler();
        HttpMessageHandlerRequest request = client.CreateRequest(postMethod, postUrl);
        if (request == null)
        {
          debug_log "oops no request";
          return request;
            //throw new NullReferenceException("request is not a http request");
        }
        debug_log "request created";

        foreach (var header in headers) {
          request.SetHeader(header.Key, header.Value);
        }

        // Set up the request properties.
        //request.Method = "POST";
        //request.SetHeader("Content-Type", "multipart/form-data");
        request.SetHeader("Content-Type", contentType);
        //request.ContentType = contentType;
        //request.UserAgent = userAgent;
        //request.CookieContainer = new CookieContainer();
        request.SetHeader("Content-Length", formData.Length.ToString());

        debug_log "length set to " + formData.Length.ToString();

        //request.ContentLength = formData.Length;

        // You could add authentication here as well if needed:
        // request.PreAuthenticate = true;
        // request.AuthenticationLevel = System.Net.Security.AuthenticationLevel.MutualAuthRequested;
        // request.Headers.Add("Authorization", "Basic " + Convert.ToBase64String(System.Text.Encoding.Default.GetBytes("username" + ":" + "password")));

        return request;
    }

    private static byte[] GetMultipartFormData(Dictionary<string, object> postParameters, string boundary)
    {
        Stream formDataStream = new Uno.IO.MemoryStream();
        bool needsCLRF = false;

        foreach (var param in postParameters)
        {
            // Thanks to feedback from commenters, add a CRLF to allow multiple parameters to be added.
            // Skip it on the first parameter, add it to subsequent parameters.
            if (needsCLRF)
            {
                var bytes = Utf8.GetBytes("\r\n");
                formDataStream.Write(bytes, 0, bytes.Length);
            }

            needsCLRF = true;

            if (param.Value is FileParameter)
            {
                FileParameter fileToUpload = (FileParameter)param.Value;

                // Add just the first part of this param, since we will write the file data directly to the Stream
                string header = string.Format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"; filename=\"{2}\"\r\nContent-Type: {3}\r\n\r\n",
                    boundary,
                    param.Key,
                    fileToUpload.FileName ?? param.Key,
                    fileToUpload.ContentType ?? "application/octet-stream");
                    var bytes = Utf8.GetBytes(header);

                formDataStream.Write(bytes, 0, bytes.Length);

                // Write the file data directly to the Stream, rather than serializing it to a string.
                formDataStream.Write(fileToUpload.File, 0, fileToUpload.File.Length);
            }
            else
            {
                string postData = string.Format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"\r\n\r\n{2}",
                    boundary,
                    param.Key,
                    param.Value);
                    var bytes = Utf8.GetBytes(postData);
                formDataStream.Write(bytes, 0, bytes.Length);
            }
        }

        // Add the end of the request.  Start with a newline
        string footer = "\r\n--" + boundary + "--\r\n";
        var fbytes = Utf8.GetBytes(footer);
        formDataStream.Write(fbytes, 0, fbytes.Length);

        // Dump the Stream into a byte[]
        formDataStream.Position = 0;
        byte[] formData = new byte[(int)formDataStream.Length];
        formDataStream.Read(formData, 0, formData.Length);
        formDataStream.Close();

        return formData;
    }

    public class FileParameter
    {
        public byte[] File { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public FileParameter(byte[] file) : this(file, null) { }
        public FileParameter(byte[] file, string filename) : this(file, filename, null) { }
        public FileParameter(byte[] file, string filename, string contenttype)
        {
            File = file;
            FileName = filename;
            ContentType = contenttype;
        }
    }
}

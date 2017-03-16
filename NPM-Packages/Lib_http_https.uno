
  using Uno.Threading;
  using Uno;
  using Uno.IO;
  using Uno.UX;
  using Fuse.Scripting;
  
  namespace NpmModules
  {
    [UXGlobalModule]
    public sealed class Lib_http_https : FileModule, IModuleProvider
    {
      public Module GetModule()
  		{
  			return this;
  		}
      
      public Lib_http_https() : base(GetSource())
      {
  			Resource.SetGlobalKey(this, "http-https");
      }
      
      static FileSource GetSource()
      {
        return Bundle.Get("11t_modules").GetFile("../node_modules/http-https/http-https.js");
      }
    }
  }
  

  using Uno.Threading;
  using Uno;
  using Uno.IO;
  using Uno.UX;
  using Fuse.Scripting;
  
  namespace NpmModules
  {
    [UXGlobalModule]
    public sealed class Lib_http : FileModule, IModuleProvider
    {
      public Module GetModule()
  		{
  			return this;
  		}
      
      public Lib_http() : base(GetSource())
      {
  			Resource.SetGlobalKey(this, "http");
      }
      
      static FileSource GetSource()
      {
        return Bundle.Get("11t_modules").GetFile("../node_modules/http/index.js");
      }
    }
  }
  
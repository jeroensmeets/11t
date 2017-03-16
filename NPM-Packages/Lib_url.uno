
  using Uno.Threading;
  using Uno;
  using Uno.IO;
  using Uno.UX;
  using Fuse.Scripting;
  
  namespace NpmModules
  {
    [UXGlobalModule]
    public sealed class Lib_url : FileModule, IModuleProvider
    {
      public Module GetModule()
  		{
  			return this;
  		}
      
      public Lib_url() : base(GetSource())
      {
  			Resource.SetGlobalKey(this, "url");
      }
      
      static FileSource GetSource()
      {
        return Bundle.Get("11t_modules").GetFile("../node_modules/url/url.js");
      }
    }
  }
  
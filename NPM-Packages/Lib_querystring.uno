
  using Uno.Threading;
  using Uno;
  using Uno.IO;
  using Uno.UX;
  using Fuse.Scripting;
  
  namespace NpmModules
  {
    [UXGlobalModule]
    public sealed class Lib_querystring : FileModule, IModuleProvider
    {
      public Module GetModule()
  		{
  			return this;
  		}
      
      public Lib_querystring() : base(GetSource())
      {
  			Resource.SetGlobalKey(this, "querystring");
      }
      
      static FileSource GetSource()
      {
        return Bundle.Get("11t_modules").GetFile("../node_modules/querystring/index.js");
      }
    }
  }
  
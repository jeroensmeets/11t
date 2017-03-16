
  using Uno.Threading;
  using Uno;
  using Uno.IO;
  using Uno.UX;
  using Fuse.Scripting;
  
  namespace NpmModules
  {
    [UXGlobalModule]
    public sealed class Lib_punycode : FileModule, IModuleProvider
    {
      public Module GetModule()
  		{
  			return this;
  		}
      
      public Lib_punycode() : base(GetSource())
      {
  			Resource.SetGlobalKey(this, "punycode");
      }
      
      static FileSource GetSource()
      {
        return Bundle.Get("11t_modules").GetFile("../node_modules/punycode/punycode.js");
      }
    }
  }
  
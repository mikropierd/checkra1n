// @bun

// src/index.ts
import fs from "fs";
import path from "path";

// node_modules/oxc-transform/index.js
function requireNative() {
  const loadErrors = []

  if (process.platform === 'android') {
    if (process.arch === 'arm64') {
      try {
        return import.meta.require('../../@oxc-transform/binding-android-arm64/transform.android-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-android-arm64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm') {
      try {
        return import.meta.require(
          '../../@oxc-transform/binding-android-arm-eabi/transform.android-arm-eabi.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-android-arm-eabi')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Android ${process.arch}`))
    }
  } else if (process.platform === 'win32') {
    if (process.arch === 'x64') {
      try {
        return import.meta.require(
          '../../@oxc-transform/binding-win32-x64-msvc/transform.win32-x64-msvc.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-win32-x64-msvc')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'ia32') {
      try {
        return import.meta.require(
          '../../@oxc-transform/binding-win32-ia32-msvc/transform.win32-ia32-msvc.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-win32-ia32-msvc')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm64') {
      try {
        return import.meta.require(
          '../../@oxc-transform/binding-win32-arm64-msvc/transform.win32-arm64-msvc.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-win32-arm64-msvc')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Windows: ${process.arch}`))
    }
  } else if (process.platform === 'darwin') {
    try {
      return import.meta.require(
        '../../@oxc-transform/binding-darwin-universal/transform.darwin-universal.node',
      )
    } catch (e) {
      loadErrors.push(e)
    }

    try {
      return import.meta.require('@oxc-transform/binding-darwin-universal')
    } catch (e) {
      loadErrors.push(e)
    }

    if (process.arch === 'x64') {
      try {
        return import.meta.require('../../@oxc-transform/binding-darwin-x64/transform.darwin-x64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-darwin-x64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm64') {
      try {
        return import.meta.require('../../@oxc-transform/binding-darwin-arm64/transform.darwin-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        console.log('import.meta.require darwinarm64')
        return import.meta.require('@oxc-transform/binding-darwin-arm64')
      } catch (e) {
        console.log('import.meta.require darwinarm64 error', e)
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on macOS: ${process.arch}`))
    }
  } else if (process.platform === 'freebsd') {
    if (process.arch === 'x64') {
      try {
        return import.meta.require('../../@oxc-transform/binding-freebsd-x64/transform.freebsd-x64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-freebsd-x64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm64') {
      try {
        return import.meta.require('../../@oxc-transform/binding-freebsd-arm64/transform.freebsd-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-freebsd-arm64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on FreeBSD: ${process.arch}`))
    }
  } else if (process.platform === 'linux') {
    if (process.arch === 'x64') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-x64-musl/transform.linux-x64-musl.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-x64-musl')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-x64-gnu/transform.linux-x64-gnu.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-x64-gnu')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'arm64') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-arm64-musl/transform.linux-arm64-musl.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm64-musl')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-arm64-gnu/transform.linux-arm64-gnu.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm64-gnu')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'arm') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-arm-musleabihf/transform.linux-arm-musleabihf.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm-musleabihf')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-arm-gnueabihf/transform.linux-arm-gnueabihf.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm-gnueabihf')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'riscv64') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-riscv64-musl/transform.linux-riscv64-musl.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-riscv64-musl')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../../@oxc-transform/binding-linux-riscv64-gnu/transform.linux-riscv64-gnu.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-riscv64-gnu')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'ppc64') {
      try {
        return import.meta.require(
          '../../@oxc-transform/binding-linux-ppc64-gnu/transform.linux-ppc64-gnu.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-linux-ppc64-gnu')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 's390x') {
      try {
        return import.meta.require(
          '../../@oxc-transform/binding-linux-s390x-gnu/transform.linux-s390x-gnu.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-linux-s390x-gnu')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Linux: ${process.arch}`))
    }
  } else {
    loadErrors.push(new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`))
  }
  console.log('end here')
}
var { readFileSync } = import.meta.require("fs");
var nativeBinding = null;
var loadErrors = [];
var isMusl = () => {
  let musl = false;
  if (process.platform === "linux") {
    musl = isMuslFromFilesystem();
    if (musl === null) {
      musl = isMuslFromReport();
    }
    if (musl === null) {
      musl = isMuslFromChildProcess();
    }
  }
  return musl;
};
var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
var isMuslFromFilesystem = () => {
  try {
    return readFileSync("/usr/bin/ldd", "utf-8").includes("musl");
  } catch {
    return null;
  }
};
var isMuslFromReport = () => {
  const report = typeof process.report.getReport === "function" ? process.report.getReport() : null;
  if (!report) {
    return null;
  }
  if (report.header && report.header.glibcVersionRuntime) {
    return false;
  }
  if (Array.isArray(report.sharedObjects)) {
    if (report.sharedObjects.some(isFileMusl)) {
      return true;
    }
  }
  return false;
};
var isMuslFromChildProcess = () => {
  try {
    return import.meta.require("child_process").execSync("ldd --version", { encoding: "utf8" }).includes("musl");
  } catch (e) {
    return false;
  }
};
nativeBinding = requireNative();
if (!nativeBinding || process.env.NAPI_RS_FORCE_WASI) {
  try {
    nativeBinding = (()=>{throw new Error(`Cannot require module "./transform.wasi.cjs"`);})();
  } catch (err) {
    if (process.env.NAPI_RS_FORCE_WASI) {
      console.error(err);
    }
  }
  if (!nativeBinding) {
    try {
      nativeBinding = (()=>{throw new Error(`Cannot require module "@oxc-transform/binding-wasm32-wasi"`);})();
    } catch (err) {
      if (process.env.NAPI_RS_FORCE_WASI) {
        console.error(err);
      }
    }
  }
}
if (!nativeBinding) {
  if (loadErrors.length > 0) {
    throw new Error("Failed to load native binding", { cause: loadErrors });
  }
  throw new Error(`Failed to load native binding`);
}
var $isolatedDeclaration = nativeBinding.isolatedDeclaration;
var $transform = nativeBinding.transform;

// src/index.ts
async function generate(options) {
  const cwd = options?.cwd ?? process.cwd();
  const root = options?.root ?? "src";
  const outdir = options?.outdir ?? "./dist/";
  const files = options?.files;
  const rootDir = path.join(cwd, root);
  if (files) {
    const f = Array.isArray(files) ? files : [files];
    for (const file of f) {
      await processFile(path.join(cwd, file), rootDir, cwd, outdir);
    }
  } else {
    const glob = new Bun.Glob("**/*.ts");
    for await (const file of glob.scan({ cwd: rootDir, absolute: true })) {
      await processFile(file, rootDir, cwd, outdir);
    }
  }
}
async function processFile(file, rootDir, cwd, outdir) {
  if (fs.existsSync(file)) {
    const ts = fs.readFileSync(file, "utf-8");
    const dts = $isolatedDeclaration(file, ts, { sourcemap: false });
    const code = dts.code;
    const relativePath = path.relative(rootDir, file);
    const outputPath = path.join(cwd, outdir, relativePath.replace(/\.ts$/, ".d.ts"));
    write(outputPath, code);
  } else {
    console.warn(`File not found: ${file}`);
  }
}
function write(file, content) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content);
}
function dts(options) {
  return {
    name: "bun-plugin-dts-auto",
    async setup(build) {
      const root = options?.root ?? build.config.root ?? "./src/";
      const outdir = options?.outdir ?? "./dist/";
      const cwd = options?.cwd ?? process.cwd();
      const files = options?.files;
      await generate({
        ...options,
        root,
        outdir,
        cwd,
        files
      });
    }
  };
}
var src_default = dts;
export {
  generate,
  dts,
  src_default as default
};

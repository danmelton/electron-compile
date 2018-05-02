'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enableLiveReload = enableLiveReload;

var _fileChangeCache = require('./file-change-cache');

var _fileChangeCache2 = _interopRequireDefault(_fileChangeCache);

var _pathwatcherRx = require('./pathwatcher-rx');

var _Observable = require('rxjs/Observable');

require('./custom-operators');

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

require('rxjs/add/observable/fromPromise');

require('rxjs/add/operator/catch');

require('rxjs/add/operator/filter');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/timeout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let BrowserWindow;
if (process.type === 'browser') {
  BrowserWindow = require('electron').BrowserWindow;
}

function reloadAllWindows() {
  let ret = BrowserWindow.getAllWindows().map(wnd => {
    if (!wnd.isVisible()) return Promise.resolve(true);

    return new Promise(res => {
      wnd.webContents.reloadIgnoringCache();
      wnd.once('ready-to-show', () => res(true));
    });
  });

  return Promise.all(ret);
}

function triggerHMRInRenderers() {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('__electron-compile__HMR');
  });

  return Promise.resolve(true);
}

function triggerAssetReloadInRenderers(filePath) {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('__electron-compile__stylesheet_reload', filePath);
  });

  return Promise.resolve(true);
}

const defaultOptions = {
  'strategy': {
    'text/html': 'naive',
    'text/tsx': 'react-hmr',
    'text/jsx': 'react-hmr',
    'application/javascript': 'react-hmr',
    'text/stylus': 'hot-stylesheets',
    'text/sass': 'hot-stylesheets',
    'text/scss': 'hot-stylesheets',
    'text/css': 'hot-stylesheets'
  }
};

function setupWatchHMR(filePath) {
  (0, _pathwatcherRx.watchPath)(filePath).subscribe(() => triggerHMRInRenderers());
}

function setWatchHotAssets(filePath) {
  (0, _pathwatcherRx.watchPath)(filePath).subscribe(() => triggerAssetReloadInRenderers(filePath));
}

function setupWatchNaive(filePath) {
  (0, _pathwatcherRx.watchPath)(filePath).subscribe(() => reloadAllWindows());
}

function enableLiveReload() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultOptions;
  let strategy = options.strategy;


  if (process.type !== 'browser' || !global.globalCompilerHost) throw new Error("Call this from the browser process, right after initializing electron-compile");

  // Just to handle the old case
  let oldsyntax = false;
  if (typeof strategy === 'string') {
    oldsyntax = true;
  }

  // Enable the methods described in the reload strategy
  for (let mime of Object.keys(strategy)) {
    switch (oldsyntax ? strategy : strategy[mime]) {
      case 'react-hmr':
        global.__electron_compile_hmr_enabled__ = true;
        break;
      case 'hot-stylesheets':
        global.__electron_compile_stylesheet_reload_enabled__ = true;
        break;
    }
  }

  // Find all the files compiled by electron-compile and setup watchers
  let filesWeCareAbout = global.globalCompilerHost.listenToCompileEvents().filter(x => !_fileChangeCache2.default.isInNodeModules(x.filePath)).subscribe(x => {
    switch (oldsyntax ? strategy : strategy[x.mimeType]) {
      case 'react-hmr':
        setupWatchHMR(x.filePath);
        break;
      case 'hot-stylesheets':
        setWatchHotAssets(x.filePath);
        break;
      case 'naive':
      default:
        setupWatchNaive(x.filePath);
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saXZlLXJlbG9hZC5qcyJdLCJuYW1lcyI6WyJlbmFibGVMaXZlUmVsb2FkIiwiQnJvd3NlcldpbmRvdyIsInByb2Nlc3MiLCJ0eXBlIiwicmVxdWlyZSIsInJlbG9hZEFsbFdpbmRvd3MiLCJyZXQiLCJnZXRBbGxXaW5kb3dzIiwibWFwIiwid25kIiwiaXNWaXNpYmxlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZXMiLCJ3ZWJDb250ZW50cyIsInJlbG9hZElnbm9yaW5nQ2FjaGUiLCJvbmNlIiwiYWxsIiwidHJpZ2dlckhNUkluUmVuZGVyZXJzIiwiZm9yRWFjaCIsIndpbmRvdyIsInNlbmQiLCJ0cmlnZ2VyQXNzZXRSZWxvYWRJblJlbmRlcmVycyIsImZpbGVQYXRoIiwiZGVmYXVsdE9wdGlvbnMiLCJzZXR1cFdhdGNoSE1SIiwic3Vic2NyaWJlIiwic2V0V2F0Y2hIb3RBc3NldHMiLCJzZXR1cFdhdGNoTmFpdmUiLCJvcHRpb25zIiwic3RyYXRlZ3kiLCJnbG9iYWwiLCJnbG9iYWxDb21waWxlckhvc3QiLCJFcnJvciIsIm9sZHN5bnRheCIsIm1pbWUiLCJPYmplY3QiLCJrZXlzIiwiX19lbGVjdHJvbl9jb21waWxlX2htcl9lbmFibGVkX18iLCJfX2VsZWN0cm9uX2NvbXBpbGVfc3R5bGVzaGVldF9yZWxvYWRfZW5hYmxlZF9fIiwiZmlsZXNXZUNhcmVBYm91dCIsImxpc3RlblRvQ29tcGlsZUV2ZW50cyIsImZpbHRlciIsIngiLCJGaWxlQ2hhbmdlZENhY2hlIiwiaXNJbk5vZGVNb2R1bGVzIiwibWltZVR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7O1FBMkVnQkEsZ0IsR0FBQUEsZ0I7O0FBM0VoQjs7OztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBSUMsYUFBSjtBQUNBLElBQUlDLFFBQVFDLElBQVIsS0FBaUIsU0FBckIsRUFBZ0M7QUFDOUJGLGtC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b0IsQ0FDYkMsS0FBSyxDQUFDQywwQkFBaUJDLGVBQWpCLENBQWlDRixFQUFFcEIsUUFBbkMsQ0FETyxFQUVwQkcsU0FGb0IsQ0FFVmlCLEtBQUs7QUFDZCxZQUFPVCxZQUFZSixRQUFaLEdBQXVCQSxTQUFTYSxFQUFFRyxRQUFYLENBQTlCO0FBQ0EsV0FBSyxXQUFMO0FBQ0VyQixzQkFBY2tCLEVBQUVwQixRQUFoQjtBQUNBO0FBQ0YsV0FBSyxpQkFBTDtBQUNFSSwwQkFBa0JnQixFQUFFcEIsUUFBcEI7QUFDQTtBQUNGLFdBQUssT0FBTDtBQUNBO0FBQ0VLLHdCQUFnQmUsRUFBRXBCLFFBQWxCO0FBVEY7QUFXRCxHQWRvQixDQUF2QjtBQWVEIiwiZmlsZSI6ImxpdmUtcmVsb2FkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEZpbGVDaGFuZ2VkQ2FjaGUgZnJvbSAnLi9maWxlLWNoYW5nZS1jYWNoZSc7XG5pbXBvcnQge3dhdGNoUGF0aH0gZnJvbSAnLi9wYXRod2F0Y2hlci1yeCc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5cbmltcG9ydCAnLi9jdXN0b20tb3BlcmF0b3JzJztcblxuaW1wb3J0ICdyeGpzL2FkZC9vYnNlcnZhYmxlL2RlZmVyJztcbmltcG9ydCAncnhqcy9hZGQvb2JzZXJ2YWJsZS9lbXB0eSc7XG5pbXBvcnQgJ3J4anMvYWRkL29ic2VydmFibGUvZnJvbVByb21pc2UnO1xuXG5pbXBvcnQgJ3J4anMvYWRkL29wZXJhdG9yL2NhdGNoJztcbmltcG9ydCAncnhqcy9hZGQvb3BlcmF0b3IvZmlsdGVyJztcbmltcG9ydCAncnhqcy9hZGQvb3BlcmF0b3IvbWVyZ2VNYXAnO1xuaW1wb3J0ICdyeGpzL2FkZC9vcGVyYXRvci9zd2l0Y2hNYXAnO1xuaW1wb3J0ICdyeGpzL2FkZC9vcGVyYXRvci90aW1lb3V0JztcblxubGV0IEJyb3dzZXJXaW5kb3c7XG5pZiAocHJvY2Vzcy50eXBlID09PSAnYnJvd3NlcicpIHtcbiAgQnJvd3NlcldpbmRvdyA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuQnJvd3NlcldpbmRvdztcbn1cblxuZnVuY3Rpb24gcmVsb2FkQWxsV2luZG93cygpIHtcbiAgbGV0IHJldCA9IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLm1hcCh3bmQgPT4ge1xuICAgIGlmICghd25kLmlzVmlzaWJsZSgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgIHduZC53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKCk7XG4gICAgICB3bmQub25jZSgncmVhZHktdG8tc2hvdycsICgpID0+IHJlcyh0cnVlKSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBQcm9taXNlLmFsbChyZXQpO1xufVxuXG5mdW5jdGlvbiB0cmlnZ2VySE1SSW5SZW5kZXJlcnMoKSB7XG4gIEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLmZvckVhY2goKHdpbmRvdykgPT4ge1xuICAgIHdpbmRvdy53ZWJDb250ZW50cy5zZW5kKCdfX2VsZWN0cm9uLWNvbXBpbGVfX0hNUicpO1xuICB9KTtcblxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xufVxuXG5mdW5jdGlvbiB0cmlnZ2VyQXNzZXRSZWxvYWRJblJlbmRlcmVycyhmaWxlUGF0aCkge1xuICBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKS5mb3JFYWNoKCh3aW5kb3cpID0+IHtcbiAgICB3aW5kb3cud2ViQ29udGVudHMuc2VuZCgnX19lbGVjdHJvbi1jb21waWxlX19zdHlsZXNoZWV0X3JlbG9hZCcsIGZpbGVQYXRoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbn1cblxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICdzdHJhdGVneSc6IHtcbiAgICAndGV4dC9odG1sJzogJ25haXZlJyxcbiAgICAndGV4dC90c3gnOiAncmVhY3QtaG1yJyxcbiAgICAndGV4dC9qc3gnOiAncmVhY3QtaG1yJyxcbiAgICAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc6ICdyZWFjdC1obXInLFxuICAgICd0ZXh0L3N0eWx1cyc6ICdob3Qtc3R5bGVzaGVldHMnLFxuICAgICd0ZXh0L3Nhc3MnOiAnaG90LXN0eWxlc2hlZXRzJyxcbiAgICAndGV4dC9zY3NzJzogJ2hvdC1zdHlsZXNoZWV0cycsXG4gICAgJ3RleHQvY3NzJyA6ICdob3Qtc3R5bGVzaGVldHMnXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0dXBXYXRjaEhNUihmaWxlUGF0aCkge1xuICB3YXRjaFBhdGgoZmlsZVBhdGgpLnN1YnNjcmliZSgoKSA9PiB0cmlnZ2VySE1SSW5SZW5kZXJlcnMoKSlcbn1cblxuZnVuY3Rpb24gc2V0V2F0Y2hIb3RBc3NldHMoZmlsZVBhdGgpIHtcbiAgd2F0Y2hQYXRoKGZpbGVQYXRoKS5zdWJzY3JpYmUoKCkgPT4gdHJpZ2dlckFzc2V0UmVsb2FkSW5SZW5kZXJlcnMoZmlsZVBhdGgpKVxufVxuXG5mdW5jdGlvbiBzZXR1cFdhdGNoTmFpdmUoZmlsZVBhdGgpIHtcbiAgd2F0Y2hQYXRoKGZpbGVQYXRoKS5zdWJzY3JpYmUoKCkgPT4gcmVsb2FkQWxsV2luZG93cygpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlTGl2ZVJlbG9hZChvcHRpb25zPWRlZmF1bHRPcHRpb25zKSB7XG4gIGxldCB7IHN0cmF0ZWd5IH0gPSBvcHRpb25zO1xuXG4gIGlmIChwcm9jZXNzLnR5cGUgIT09ICdicm93c2VyJyB8fCAhZ2xvYmFsLmdsb2JhbENvbXBpbGVySG9zdCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbCB0aGlzIGZyb20gdGhlIGJyb3dzZXIgcHJvY2VzcywgcmlnaHQgYWZ0ZXIgaW5pdGlhbGl6aW5nIGVsZWN0cm9uLWNvbXBpbGVcIik7XG5cbiAgLy8gSnVzdCB0byBoYW5kbGUgdGhlIG9sZCBjYXNlXG4gIGxldCBvbGRzeW50YXggPSBmYWxzZVxuICBpZiAodHlwZW9mIHN0cmF0ZWd5ID09PSAnc3RyaW5nJykge1xuICAgIG9sZHN5bnRheCA9IHRydWVcbiAgfVxuXG4gIC8vIEVuYWJsZSB0aGUgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIHJlbG9hZCBzdHJhdGVneVxuICBmb3IgKGxldCBtaW1lIG9mIE9iamVjdC5rZXlzKHN0cmF0ZWd5KSkgeyBcbiAgICBzd2l0Y2gob2xkc3ludGF4ID8gc3RyYXRlZ3kgOiBzdHJhdGVneVttaW1lXSkge1xuICAgIGNhc2UgJ3JlYWN0LWhtcic6XG4gICAgICBnbG9iYWwuX19lbGVjdHJvbl9jb21waWxlX2htcl9lbmFibGVkX18gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaG90LXN0eWxlc2hlZXRzJzpcbiAgICAgIGdsb2JhbC5fX2VsZWN0cm9uX2NvbXBpbGVfc3R5bGVzaGVldF9yZWxvYWRfZW5hYmxlZF9fID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgYWxsIHRoZSBmaWxlcyBjb21waWxlZCBieSBlbGVjdHJvbi1jb21waWxlIGFuZCBzZXR1cCB3YXRjaGVyc1xuICBsZXQgZmlsZXNXZUNhcmVBYm91dCA9IGdsb2JhbC5nbG9iYWxDb21waWxlckhvc3QubGlzdGVuVG9Db21waWxlRXZlbnRzKClcbiAgICAuZmlsdGVyKHggPT4gIUZpbGVDaGFuZ2VkQ2FjaGUuaXNJbk5vZGVNb2R1bGVzKHguZmlsZVBhdGgpKVxuICAgIC5zdWJzY3JpYmUoeCA9PiB7XG4gICAgICBzd2l0Y2gob2xkc3ludGF4ID8gc3RyYXRlZ3kgOiBzdHJhdGVneVt4Lm1pbWVUeXBlXSkge1xuICAgICAgY2FzZSAncmVhY3QtaG1yJzpcbiAgICAgICAgc2V0dXBXYXRjaEhNUih4LmZpbGVQYXRoKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hvdC1zdHlsZXNoZWV0cyc6XG4gICAgICAgIHNldFdhdGNoSG90QXNzZXRzKHguZmlsZVBhdGgpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFpdmUnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc2V0dXBXYXRjaE5haXZlKHguZmlsZVBhdGgpXG4gICAgICB9XG4gICAgfSk7XG59Il19
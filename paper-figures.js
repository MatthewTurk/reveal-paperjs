var PaperFigures = ( function( Reveal ){

    var options = Reveal.getConfig()['paper-figures'] || {};
    options.paperjs = options.paperjs || 'https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.0/paper-full.min.js';

    // https://javascript.info/promise-basics
    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error("Script load error: " + src));

            document.head.append(script);
            console.log("Appending ", src);
        });
    }

    function loadPaperFigure(path, callback) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    // The request is done; did it work?
                    if (xhr.status == 200) {
                        // Yes, use `xhr.responseText` to resolve the promise
                        resolve(xhr.responseText);
                    } else {
                        // No, reject the promise
                        reject(xhr);
                    }
                }
            };
            xhr.open("GET", path);
            xhr.send();
        });
    }

    let promise = loadScript(options.paperjs);
    promise.then( function() {

        function disablePaper(slide) {
            if (!slide.hasAttribute("data-paper-canvas")) return;
            canvasId = slide.getAttribute("data-paper-canvas");
            myCanvas = slide.querySelector("canvas#" + canvasId);
            if (!myCanvas.hasAttribute("data-paper-scope")) {
                // Seems like it isn't initialized
                return;
            }
            paper.PaperScope.get(myCanvas.getAttribute("data-paper-scope")).view.pause();
        };

        function enablePaper(slide) {
            if (!slide.hasAttribute("data-paper-canvas")) return;
            canvasId = slide.getAttribute("data-paper-canvas");
            myCanvas = slide.querySelector("canvas#" + canvasId);
            if (!myCanvas.hasAttribute("data-paper-scope")) {
                scope = new paper.PaperScope();
                scope.install(myCanvas);
                scope.setup(myCanvas);
                myCanvas.setAttribute("data-paper-scope", scope._id);
                // Now we asynchronously load
                loadPaperFigure("./" + canvasId + ".js")
                    .then(function(fileData) {
                        scope.execute(fileData, {'url': "./" + canvasId + ".js", 'source': fileData});
                        scope.view.play();
                    })
                    .catch(function(xhr) {
                        console.log("Failed to load: ", xhr);
                    });
            } else {
                paper.PaperScope.get(myCanvas.getAttribute("data-paper-scope")).view.play();
            }
        };
        Reveal.addEventListener( 'slidechanged', function(event) {
            disablePaper(event.previousSlide);
            enablePaper(event.currentSlide);
        });
        enablePaper(Reveal.getCurrentSlide());
    });

})( Reveal );



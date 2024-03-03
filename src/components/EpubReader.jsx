import React, { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import "./EpubReader.css";

function EpubReader({ url = "PrideAndPrejudice.epub" }) {
    const tocRef = useRef(null);
    const epubViewRef = useRef(null);

    const [rendition, setRendition] = useState(null);
    const [book, setBook] = useState(null);

    useEffect(() => {
        const book = ePub(url);
        setBook(book);

        const rendition = book.renderTo("epubView", {
            width: "100%",
            height: "60%",
            spread: "always",
        });
        setRendition(rendition);
        rendition.display(undefined);

        return () => {
            book.destroy();
        };
    }, [url]);

    const handleNext = () => {
        rendition?.next();
    };

    const handlePrev = () => {
        rendition?.prev();
    };

    const handleKey = (event) => {
        if (event.keyCode === 37) {
            handlePrev();
        } else if (event.keyCode === 39) {
            handleNext();
        }
    };

    const handleTocChange = (event) => {
        const url = event.target.value;
        console.log("url", url);
        rendition?.display(url);
    };

    useEffect(() => {
        if (rendition) {
            rendition.on("keyup", handleKey);
            //   document.addEventListener("keyup", handleKey);

            rendition.on("rendered", (section) => {
                const current = book.navigation?.get(section.href);
                console.log("current", current.href);
                console.log("tocRef.current", tocRef.current);

                if (current) {
                    const option = tocRef.current.querySelector(`option[value="${current.href}"]`);
                    console.log("option", option);
                    if (option) {
                        option.selected = true;
                    }
                }
            });

            rendition.on("relocated", (location) => {
                const next = document.getElementById("next");
                const prev = document.getElementById("prev");
                next.style.visibility = location.atEnd ? "hidden" : "visible";
                prev.style.visibility = location.atStart ? "hidden" : "visible";
            });

            rendition.on("layout", (layout) => {
                const viewer = document.getElementById("viewer");
                viewer.classList.toggle("single", !layout.spread);
            });
        }

        return () => {
            if (rendition) {
                rendition.off("keyup", handleKey);
                document.removeEventListener("keyup", handleKey);
            }
        };
    }, [rendition]);

    useEffect(() => {
        if (rendition) {
            book.loaded.navigation.then((toc) => {
                const fragment = document.createDocumentFragment();
                toc.forEach((chapter) => {
                    const option = document.createElement("option");
                    option.textContent = chapter.label;
                    option.value = chapter.href;
                    fragment.appendChild(option);
                });
                tocRef.current.appendChild(fragment);
            });
        }
    }, [rendition]);

    return (
        <div>
            <select id="toc" ref={tocRef} onChange={handleTocChange} />
            <div id="epubView" ref={epubViewRef} className="spreads" />
            <a id="prev" href="#prev" className="arrow" onClick={handlePrev}>
                &lt;
            </a>
            <a id="next" href="#next" className="arrow" onClick={handleNext}>
                &gt;
            </a>
        </div>
    );
}

export default EpubReader;

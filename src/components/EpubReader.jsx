import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ePub from "epubjs";
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';

import "./testing.css";

function EpubReader({ URL = "PrideAndPrejudice.epub" }) {
    const epubViewerRef = useRef(null);

    const [rendition, setRendition] = useState(null);
    const [atStart, setAtStart] = useState(false);
    const [atEnd, setAtEnd] = useState(false);

    const createBook = (URL) => {
        return ePub(URL);
    }

    const createRendition = (book) => {
        const rendition = book.renderTo(epubViewerRef.current, {
            spread: "always",
        });
        rendition.display();
        setRendition(rendition);
        return rendition;
    } 

    const setup = () => {
        const book = createBook(URL);
        const rendition = createRendition(book);

        return [book, rendition];
    }
    
    const handleNextPage = () => {
        rendition?.next();
    };

    const handlePreviousPage = () => {
        rendition?.prev();
    };

    const handleKeyPress = (event) => {
        const ARROW_LEFT = 37, ARROW_RIGHT = 39;

        if (event.keyCode === ARROW_LEFT) {
            handlePreviousPage();
        } else if (event.keyCode === ARROW_RIGHT) {
            handleNextPage();
        }
    };

    const setupRenditionHooks = () => {
        rendition.on("keyup", (e) => {
            console.log("rendition keyup");
            handleKeyPress(e);
        });
        // document.addEventListener("keyup", handleKeyPress);

        rendition.on("relocated", (location) => {
            console.log("rendition relocated");

            if(location.atStart) {
                setAtStart(true); setAtEnd(false);
            } else if (location.atEnd) {
                setAtStart(false); setAtEnd(true);
            } else {
                setAtStart(false); setAtEnd(false);
            }
        });
    }

    const cleanUpRenditionHooks = () => {
        rendition.off("keyup", handleKeyPress);
    }

    useEffect(() => {
        const [book, rendition] = setup();

        return () => {
            book.destroy();
            rendition.destroy();
        }; 
    }, [URL]);

    useEffect(() => {
        if(!rendition) return;

        setupRenditionHooks();

        return () => {
            if(!rendition) return;
            cleanUpRenditionHooks();
        };
    }, [rendition])
    
    return (
        <div>
            <div id="viewer" ref={epubViewerRef} className="spreads" />
            {   
                !atStart 
                    && 
                <ChevronLeftOutlined className="hand-on-hover" color="primary" onClick={handlePreviousPage}/>
            }
            {
                !atEnd 
                    && 
                <ChevronRightOutlined className="hand-on-hover" color="primary" onClick={handleNextPage}/>
            }
        </div>
    );
}

export default EpubReader;

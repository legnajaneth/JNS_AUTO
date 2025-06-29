import React, {useState} from "react";
import "./homePage.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
//import IMG_1 from "../images/IMG_1.jpg";
//import IMG_2 from "../images/IMG_2.jpg";
//import IMG_3 from "../images/IMG_3.jpg";
//import IMG_4 from "../images/IMG_4.jpg";
//import vid_1 from "../videos/vid_1.mov";
/*import vid_2 from "../videos/vid_2.mov";
import vid_3 from "../videos/vid_3.mov";
import vid_4 from "../videos/vid_4.Mov";
import vid_5 from "../videos/vid_5.mov";*/

function HomePage() {
/*  const [slideIndex, setSlideIndex] = useState(0)
  const changeSlide = (n) => {
    const totalSlides = images.length;
    const newIndex = (slideIndex + n + totalSlides) % totalSlides; // Wraps index around
    setSlideIndex(newIndex);
  };
  const images = [IMG_1, IMG_2, IMG_3, IMG_4];*/
    return (
      <div className="homepage">
        <header className="main-header">
          <div className="title-spot">
            <h1 className="title" ><b><i>JNS AUTO SPA</i></b></h1>
              <p className="descr"><b><i> Stay Clean</i></b> </p>
          </div>
        {/*  <div className="right-content">
            <div className="pic-border">

            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Slide ${index + 1}`}
                className={`mySlides ${index === slideIndex ? "active" : ""}`}
              />
            ))}
            <button
              className="next-pic-left"
              onClick={() => changeSlide(-1)}
              >&#10094;
            </button>
            <button
              className="next-pic-right"
              onClick={() => changeSlide(1)}
              >&#10095;
            </button>
      </div>
      </div>
      </header> 
     <div className= "videos">
         <section> videos go here</section>
        <video controls width="640" height="360"><source src={vid_1} type="video/quicktime" /></video>
      </div> */}
      </header>
      </div>
    );
  };
  export default HomePage;
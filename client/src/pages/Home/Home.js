// import React, { useState } from 'react';
// import Navbar from '../../components/Navbar/Navbar';
// import './Home.css';

// const Home = () => {
//     const [file, setFile] = useState(null);

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (!file) {
//             alert('Please select a file');
//             return;
//         }

//         try {
//             const formData = new FormData();
//             formData.append('image', file);

//             const response = await fetch('http://127.0.0.1:8000/classify', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (response.ok) {
// 				const data = await response.json();
// 				alert(data.prediction);
//             } else {
//                 alert('Failed to upload file');
//             }
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             alert('Failed to upload file');
//         }
//     };

//     return (
//         <>
//             <Navbar />
//             <section className="hero-section">
//                 <h1>Home Page</h1>
//                 <form onSubmit={handleSubmit}>
//                     <div>
//                         <input type="file" onChange={handleFileChange} />
//                     </div>
//                     <div>
//                         <button type="submit">Upload</button>
//                     </div>
//                 </form>
//             </section>
//         </>
//     );
// };

// export default Home;

import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import './Home.css';

const Home = () => {
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [predictionAlert, setPredictionAlert] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        setFile(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewURL(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewURL('');
        }
    };

    const handleCameraCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            const mediaStreamTrack = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(mediaStreamTrack);

            const blob = await imageCapture.takePhoto();
            setFile(blob);

            const previewBlobURL = URL.createObjectURL(blob);
            setPreviewURL(previewBlobURL);

            // Stop the camera stream after capturing the photo
            mediaStreamTrack.stop();
        } catch (error) {
            console.error('Error capturing image:', error);
            alert('Failed to capture image from camera');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            alert('Please select a file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://127.0.0.1:8000/classify', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setPredictionAlert(data.prediction);
            } else {
                alert('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        }
    };

    return (
        <>
            <Navbar />
            <section className="hero-section">
                <div className="center-component">
                    <h1>Upload Image</h1>
                    <div>
                        <button onClick={handleCameraCapture}>Capture from Camera</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input type="file" onChange={handleFileChange} />
                        {previewURL && <img src={previewURL} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />}
                        <button type="submit">Upload</button>
                    </form>
                    {predictionAlert && <div className="prediction-alert">{predictionAlert}</div>}
                </div>
            </section>
        </>
    );
};

export default Home;
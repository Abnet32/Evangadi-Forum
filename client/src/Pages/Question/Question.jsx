import React, { useState } from "react";
import classes from "./Question.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDown } from "@fortawesome/free-solid-svg-icons";
import axios from "../../Api/axios";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
const Question = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // success or error
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const steps = [
    "Summarize your problems in a one-line-title.",
    "Describe your problem in more detail.",
    "Describe what you tried and what you expected to happen.",
    "Review your question and post it here.",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!title || !description) {
      setAlertMessage("Please fill in all fields!");
      setAlertType("error");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        "/question/question",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlertMessage("Your question was posted successfully!");
      setAlertType("success");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error(error.response);
      setAlertMessage("Something went wrong. Please try again.");
      setAlertType("error");
    } finally {
      setIsLoading(false);
    }

    // Hide alert after 3 seconds
    setTimeout(() => setAlertMessage(""), 3000);
  };

  return (
    <section className={classes.post_question_container}>
      <div className={classes.inner_post_question_wrapper}>
        {/* Step-by-step guide */}
        <div className={classes.guide_section}>
          <h2 className={classes.post_title}>Steps To Write A Good Question</h2>
          <div className={classes.border_bottom}></div>
          {steps.map((step, index) => (
            <p key={index}>
              <FontAwesomeIcon
                icon={faCircleDown}
                rotation={270}
                style={{ marginRight: "10px", color: "#0077ff" }}
              />
              {step}
            </p>
          ))}
        </div>

        {/* Form Section */}
        <div className={classes.form_section}>
          <h3 className={classes.post_title_2}>Ask a public question</h3>
          <Link to="/" className={classes.go_to}>
            Go to Home page
          </Link>
          {alertMessage && (
            <div
              className={`${classes.question_alert_message} ${
                alertType === "success" ? classes.success : classes.error
              }`}
            >
              {alertMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Question title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={classes.post_input_title}
            />
            <textarea
              rows="8"
              placeholder="Question description ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={classes.post_textarea}
            />
            <button className={classes.post_button} type="submit">
              {isLoading ? <ClipLoader size={18} /> : "Post Question"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Question;

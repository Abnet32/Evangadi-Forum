import React, { useState, useEffect } from "react";
import classes from "./Answer.module.css";
import { IoMdContact } from "react-icons/io";
import instance from "../../Api/axios";
import { useParams } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";

function Answer() {
  const { questionId } = useParams();
  const token = localStorage.getItem("token");

  const [answer, setAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [question, setQuestion] = useState({ title: "", description: "" });
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const answersPerPage = 2;

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await instance.get(`/question/question/${questionId}`, {
        headers: { authorization: "Bearer " + token },
      });

      setQuestion({
        title: response.data.question.title,
        description: response.data.question.description,
      });
    } catch (error) {
      console.error("Error fetching question:", error);
      setErrorMessage("Failed to load question.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      setIsLoading(true);
      const response = await instance.get(`/answer/answer/${questionId}`, {
        headers: { authorization: "Bearer " + token },
      });

      setAnswers(response.data.answers || []);
    } catch (error) {
      console.error("Error fetching answers:", error.response?.data || error);
      setErrorMessage("Failed to load answers.");
    } finally {
      setIsLoading(false);
    }
  };

  const postAnswer = async (e) => {
    e.preventDefault();
    if (!answer) {
      setErrorMessage("Please provide an answer.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await instance.post(
        `/answer/answer/${questionId}`,
        { answer },
        { headers: { authorization: "Bearer " + token } }
      );

      if (response.status === 201) {
        setSuccessMessage("Answer posted successfully 👍");
        setAnswer("");
        if (response.data.newAnswer) {
          setAnswers((prev) => [...prev, response.data.newAnswer]);
        } else {
          fetchAnswers();
        }
      }
    } catch (error) {
      console.error("Error posting answer:", error.response?.data || error);
      setErrorMessage("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, [questionId]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Pagination logic
  const totalPages = Math.ceil(answers.length / answersPerPage);
  const startIndex = (currentPage - 1) * answersPerPage;
  const currentAnswers = answers.slice(startIndex, startIndex + answersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageNumbers = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? classes.activePage : ""}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (isLoading) return <Loader />;

  return (
    <main>
      <section className={classes.question_section}>
        <h2>Question</h2>
        <h3>{question.title}</h3>
        <p className={classes.link_work}>{question.description}</p>
        <p className={classes.answersCount}>
          {answers.length} Answer{answers.length !== 1 ? "s" : ""} from
          community
        </p>
        <br />
        <hr />
      </section>

      <section className={classes.answer_section}>
        <h2>Answers From The Community</h2>
        <hr />
        {currentAnswers.length > 0 ? (
          currentAnswers.map((ans) => (
            <div className={classes.answer} key={ans.answerid}>
              <div>
                <IoMdContact size={60} />
                <h4 className={classes.username}>{ans.user_name}</h4>
              </div>
              <div className={classes.margin}>
                <p>{ans.answer}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={classes.para}>
            No answers yet. Be the first to answer! 😇
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={classes.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </section>

      <section className={classes.answer_form}>
        <h2>Answer The Top Question</h2>

        {errorMessage && <p className={classes.error}>{errorMessage}</p>}
        {successMessage && <p className={classes.success}>{successMessage}</p>}

        <textarea
          placeholder="Your Answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
        <button className={classes.submit_btn} onClick={postAnswer}>
          Post Your Answer
        </button>
      </section>
    </main>
  );
}

export default Answer;

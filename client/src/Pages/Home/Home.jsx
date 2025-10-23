import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdContact, IoIosArrowForward } from "react-icons/io";
import axios from "../../Api/axios";
import { AppState } from "../../context/DataContext";
import Loader from "../../Components/Loader/Loader";
import classes from "./Home.module.css";
import Article from "../../Components/Articles/Articles";

const Home = () => {
  const { user, setUser } = useContext(AppState);
  const token = localStorage.getItem("token");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchItem, setSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const navigate = useNavigate();

  // Fetch user info and questions
  const loadData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const userRequest = axios.get("/user/check", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const questionsRequest = axios.get("/question/question", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [userResponse, questionsResponse] = await Promise.all([
        userRequest,
        questionsRequest,
      ]);

      setUser(userResponse.data.username);
      setQuestions(questionsResponse.data.questions || []);
    } catch (error) {
      console.error("Error loading data:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and paginate questions
  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchItem.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ Show only 3 pagination numbers at a time
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
    <section className={classes.home}>
      <div className={classes.home__container}>
        {/* LEFT SIDE: Questions */}
        <div className={classes.questionsSection}>
          <div className={classes.home__topcontainer}>
            <Link to="/question" className={classes.askQuestionBtn}>
              Ask Question
            </Link>
            <p className={classes.welcomeText}>
              👋 Welcome: <span className={classes.userName}>{user}</span>
            </p>
          </div>

          <div className={classes.questionsHeader}>
            <h2>Questions</h2>
            <p className={classes.totalQuestions}>
              Total Questions: {filteredQuestions.length}
            </p>
            <div className={classes.search}>
              <input
                type="text"
                value={searchItem}
                onChange={(e) => {
                  setSearchItem(e.target.value);
                  setCurrentPage(1); // reset to page 1 on search
                }}
                placeholder="🔍 Search questions..."
              />
            </div>
          </div>

          <div>
            {currentQuestions.length === 0 ? (
              <p>No questions found.</p>
            ) : (
              currentQuestions.map((question) => (
                <div
                  className={classes.question__outercontainer}
                  key={question.question_id}
                >
                  <div className={classes.home__questioncontainer}>
                    <div className={classes.home__iconandusernamecontainer}>
                      <div>
                        <IoMdContact size={60} />
                        <p className={classes.home__questionusename}>
                          {question.user_name}
                        </p>
                      </div>
                      <div className={classes.home__questiontitle}>
                        <p>{question.title}</p>
                      </div>
                    </div>
                    <Link
                      to={`/home/answers/${question.question_id}`}
                      className={classes.answerLink}
                    >
                      <IoIosArrowForward size={30} color="black" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

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
        </div>

        {/* RIGHT SIDE: Article */}
        <div className={classes.articleWrapper}>
          <div className={classes.articleSection}>
            <Article />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;

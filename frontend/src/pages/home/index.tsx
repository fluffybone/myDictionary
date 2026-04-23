import { BookFilled, BulbFilled, SoundFilled, ThunderboltFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { LANGUAGES } from "../../constants/languages";
import classes from "./index.module.css";

const features = [
  {
    icon: <BookFilled />,
    text: "Личные словари для английского, французского, испанского, немецкого и итальянского.",
    title: "Несколько языков",
  },
  {
    icon: <SoundFilled />,
    text: "Слушайте произношение слов голосами, доступными на вашем устройстве.",
    title: "Озвучка слов",
  },
  {
    icon: <ThunderboltFilled />,
    text: "Проверяйте себя по словам, которые учите сейчас, или по уже выученному словарю.",
    title: "Тренировка памяти",
  },
  {
    icon: <BulbFilled />,
    text: "Сохраняйте языковые правила и подсказки, которые помогают запоминать быстрее.",
    title: "Правила и заметки",
  },
];

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={classes.screen}>
      <main className={classes.page}>
        <section className={classes.hero}>
          <div className={classes.heroText}>
            <p className={classes.kicker}>WordEater / Пожиратель слов</p>
            <h1 className={classes.title}>Онлайн-словарь для изучения нескольких языков</h1>
            <p className={classes.description}>
              Собирайте слова в личные словари, слушайте произношение,
              тренируйтесь и храните правила, которые помогают учиться без хаоса.
            </p>
            <div className={classes.actions}>
              <Button variant="primary" onClick={() => navigate("/auth/registration")}>
                Начать учиться
              </Button>
              <Button variant="secondary" onClick={() => navigate("/auth/login")}>
                Войти
              </Button>
            </div>
          </div>

          <div className={classes.previewCard} aria-label="Возможности WordEater">
            <div className={classes.previewHeader}>
              <span>Сегодня учу</span>
              <strong>EN</strong>
            </div>
            <div className={classes.wordCard}>
              <span className={classes.word}>curious</span>
              <span className={classes.translation}>любопытный</span>
            </div>
            <div className={classes.progressList}>
              <span>Словарь по языкам</span>
              <span>Озвучка</span>
              <span>Проверка себя</span>
              <span>Правила</span>
            </div>
          </div>
        </section>

        <section className={classes.languages} aria-label="Поддерживаемые языки">
          {LANGUAGES.map((language) => (
            <span className={classes.languageBadge} key={language.code}>
              {language.code}
            </span>
          ))}
        </section>

        <section className={classes.features}>
          {features.map((feature) => (
            <article className={classes.featureCard} key={feature.title}>
              <div className={classes.featureIcon}>{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        <section className={classes.installCard}>
          <div>
            <h2>Можно установить как приложение</h2>
            <p>
              Откройте WordEater на телефоне или компьютере и добавьте его на
              главный экран — словарь будет запускаться как обычное приложение.
            </p>
          </div>
          <Button variant="primary" size="small" onClick={() => navigate("/auth/registration")}>
            Попробовать
          </Button>
        </section>
      </main>
    </div>
  );
};

import classes from "./index.module.css";
import {
  useGetImprovementSuggestionsQuery,
  useGetUsersLastSeenQuery,
} from "../../store/authorization/api";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const SecretStats = () => {
  const {
    data: lastSeenData,
    isLoading,
    isError,
  } = useGetUsersLastSeenQuery();
  const {
    data: suggestionsData,
    isLoading: isSuggestionsLoading,
    isError: isSuggestionsError,
  } = useGetImprovementSuggestionsQuery();

  if (isLoading) {
    return (
      <section className={classes.page}>
        <div className={classes.hero}>
          <p className={classes.eyebrow}>Скрытая страница</p>
          <h1 className={classes.title}>Загружаем последние посещения...</h1>
        </div>
      </section>
    );
  }

  if (isError || !lastSeenData) {
    return (
      <section className={classes.page}>
        <div className={classes.hero}>
          <p className={classes.eyebrow}>Скрытая страница</p>
          <h1 className={classes.title}>Не удалось получить список посещений</h1>
          <p className={classes.description}>
            Проверьте, что вы авторизованы и сервер доступен.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={classes.page}>
      <div className={classes.hero}>
        <div>
          <p className={classes.eyebrow}>Скрытая страница</p>
          <h1 className={classes.title}>Последние посещения пользователей</h1>
          <p className={classes.description}>
            Отмечаем пользователя только когда он запрашивает слова, и не чаще одного раза в день.
          </p>
        </div>
        <div className={classes.heroBadge}>/vault/users-overview</div>
      </div>

      <div className={classes.cards}>
        <article className={classes.card}>
          <p className={classes.cardLabel}>Всего пользователей</p>
          <strong className={classes.cardValue}>{lastSeenData.total_users}</strong>
        </article>
        <article className={classes.card}>
          <p className={classes.cardLabel}>Предложений по улучшению</p>
          <strong className={classes.cardValue}>{suggestionsData?.suggestions.length ?? 0}</strong>
        </article>
      </div>

      <section className={classes.tableCard}>
        <div className={classes.tableHeader}>
          <div>
            <p className={classes.sectionEyebrow}>Пользователи</p>
            <h2 className={classes.sectionTitle}>Последнее посещение и словари</h2>
          </div>
        </div>

        {lastSeenData.users.length === 0 ? (
          <p className={classes.emptyState}>Пока нет пользователей.</p>
        ) : (
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>ID пользователя</th>
                  <th>Последнее посещение</th>
                  <th>Всего слов</th>
                  <th>EN</th>
                  <th>DE</th>
                  <th>FR</th>
                  <th>ES</th>
                  <th>IT</th>
                </tr>
              </thead>
              <tbody>
                {lastSeenData.users.map((row) => (
                  <tr key={row.user_id}>
                    <td>{row.user_id}</td>
                    <td>
                      {row.last_seen_at
                        ? formatDateTime(row.last_seen_at)
                        : "Еще не запрашивал слова"}
                    </td>
                    <td>{row.total_words}</td>
                    <td>{row.en_words}</td>
                    <td>{row.de_words}</td>
                    <td>{row.fr_words}</td>
                    <td>{row.es_words}</td>
                    <td>{row.it_words}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={classes.tableCard}>
        <div className={classes.tableHeader}>
          <div>
            <p className={classes.sectionEyebrow}>Фидбек</p>
            <h2 className={classes.sectionTitle}>Предложения пользователей</h2>
          </div>
        </div>

        {isSuggestionsLoading ? (
          <p className={classes.emptyState}>Загружаем предложения...</p>
        ) : isSuggestionsError ? (
          <p className={classes.emptyState}>Не удалось получить предложения.</p>
        ) : !suggestionsData || suggestionsData.suggestions.length === 0 ? (
          <p className={classes.emptyState}>Пока никто ничего не предложил.</p>
        ) : (
          <div className={classes.suggestionsList}>
            {suggestionsData.suggestions.map((suggestion) => (
              <article key={suggestion.id} className={classes.suggestionCard}>
                <div className={classes.suggestionMeta}>
                  <span className={classes.actionBadge}>user #{suggestion.user_id}</span>
                  <span className={classes.suggestionDate}>
                    {formatDateTime(suggestion.created_at)}
                  </span>
                </div>
                <p className={classes.suggestionText}>{suggestion.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

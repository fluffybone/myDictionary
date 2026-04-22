import { DeleteOutlined } from "@ant-design/icons";
import { useMemo, useState, type FormEvent } from "react";
import clsx from "clsx";
import { Checkbox } from "../../components/Checkbox";
import { Select } from "../../components/Select";
import {
  englishRuleCategories,
  englishRuleCategoryLabels,
  type TEnglishRuleCategory,
} from "../../data/englishRules";
import {
  useAddRuleMutation,
  useDeleteRuleMutation,
  useGetRulesQuery,
  useUpdateRuleMutation,
  type TEnglishRule,
  type TEnglishRulePayload,
} from "../../store/rules/api";
import classes from "./index.module.css";

const createEmptyFilters = () => {
  return englishRuleCategories.reduce(
    (filters, category) => ({ ...filters, [category]: true }),
    {} as Record<TEnglishRuleCategory, boolean>,
  );
};

const createEmptyRuleForm = (): TEnglishRulePayload => ({
  category: "grammar",
  description: "",
  examples: [],
  title: "",
});

const parseExamples = (examples: string) => {
  return examples
    .split("\n")
    .map((example) => example.trim())
    .filter(Boolean);
};

export const Rules = () => {
  const { data: rules = [], isFetching: isRulesFetching } = useGetRulesQuery();
  const [addRule, { isLoading: isAddRuleLoading }] = useAddRuleMutation();
  const [updateRule, { isLoading: isUpdateRuleLoading }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();
  const [categoryFilters, setCategoryFilters] = useState(createEmptyFilters);
  const [editingRuleId, setEditingRuleId] = useState<null | TEnglishRule["id"]>(null);
  const [ruleForm, setRuleForm] = useState<TEnglishRulePayload>(createEmptyRuleForm);
  const [examplesText, setExamplesText] = useState("");

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => categoryFilters[rule.category]);
  }, [rules, categoryFilters]);

  const isEditMode = editingRuleId !== null;
  const isSubmitLoading = isAddRuleLoading || isUpdateRuleLoading;

  const resetForm = () => {
    setEditingRuleId(null);
    setRuleForm(createEmptyRuleForm());
    setExamplesText("");
  };

  const handleEditRule = (rule: TEnglishRule) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      category: rule.category,
      description: rule.description,
      examples: rule.examples,
      title: rule.title,
    });
    setExamplesText(rule.examples.join("\n"));
  };

  const handleDeleteRule = async (ruleId: TEnglishRule["id"]) => {
    await deleteRule({ id: ruleId }).unwrap();

    if (editingRuleId === ruleId) {
      resetForm();
    }
  };

  const handleSubmitRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const preparedRule = {
      ...ruleForm,
      description: ruleForm.description.trim(),
      examples: parseExamples(examplesText),
      title: ruleForm.title.trim(),
    };

    if (isEditMode) {
      await updateRule({ ...preparedRule, id: editingRuleId }).unwrap();
    } else {
      await addRule(preparedRule).unwrap();
    }

    resetForm();
  };

  return (
    <section className={classes.page}>
      <div className={classes.header}>
        <h2 className={classes.title}>Правила</h2>
        <p className={classes.subtitle}>
          Короткие подсказки, которые помогают замечать закономерности в словах.
          Правила и примеры хранятся на backend, поэтому их можно редактировать.
        </p>
        <p className={classes.footnote}>
          Стартовые правила сгенерированы нейросетью. Проверяй и адаптируй их
          под свой способ обучения.
        </p>
      </div>

      <form className={classes.form} onSubmit={handleSubmitRule}>
        <h3 className={classes.formTitle}>
          {isEditMode ? "Редактировать правило" : "Добавить свое правило"}
        </h3>
        <div className={classes.formGrid}>
          <label className={classes.inputGroup}>
            <span className={classes.inputLabel}>Название</span>
            <input
              required
              type="text"
              placeholder="Например: make / do"
              value={ruleForm.title}
              onChange={(event) =>
                setRuleForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </label>
          <Select
            label="Категория"
            value={ruleForm.category}
            options={englishRuleCategories.map((category) => ({
              label: englishRuleCategoryLabels[category],
              value: category,
            }))}
            onChange={(event) =>
              setRuleForm((prev) => ({
                ...prev,
                category: event.target.value as TEnglishRuleCategory,
              }))
            }
          />
        </div>
        <label className={classes.inputGroup}>
          <span className={classes.inputLabel}>Описание правила</span>
          <textarea
            required
            placeholder="Коротко объясни правило своими словами"
            value={ruleForm.description}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </label>
        <label className={classes.inputGroup}>
          <span className={classes.inputLabel}>Примеры</span>
          <textarea
            placeholder={"Каждый пример с новой строки\nI do homework.\nI make a decision."}
            value={examplesText}
            onChange={(event) => setExamplesText(event.target.value)}
          />
        </label>
        <div className={classes.formActions}>
          {isEditMode && (
            <button className="btn" type="button" onClick={resetForm}>
              Отмена
            </button>
          )}
          <button
            className={clsx("btn btn-secondary", classes.submitButton)}
            type="submit"
            disabled={isSubmitLoading}
          >
            {isEditMode ? "Сохранить правило" : "Добавить правило"}
          </button>
        </div>
      </form>

      <div className={classes.filters}>
        <p className={classes.filtersTitle}>Фильтр по категориям:</p>
        <div className={classes.filterList}>
          {englishRuleCategories.map((category) => (
            <Checkbox
              key={category}
              label={englishRuleCategoryLabels[category]}
              checked={categoryFilters[category]}
              onChange={(event) =>
                setCategoryFilters((prev) => ({
                  ...prev,
                  [category]: event.target.checked,
                }))
              }
            />
          ))}
        </div>
      </div>

      {isRulesFetching && <p className={classes.empty}>Загружаю правила...</p>}

      {!isRulesFetching && filteredRules.length === 0 && (
        <p className={classes.empty}>Выбери хотя бы одну категорию правил.</p>
      )}

      <div className={classes.grid}>
        {filteredRules.map((rule) => (
          <article
            className={clsx(classes.card, { [classes.customCard]: !rule.is_default })}
            key={rule.id}
          >
            <div className={classes.cardHeader}>
              <h3 className={classes.ruleTitle}>{rule.title}</h3>
              <span className={classes.badge}>
                {rule.is_default ? englishRuleCategoryLabels[rule.category] : "мое правило"}
              </span>
            </div>
            <p className={classes.description}>{rule.description}</p>
            {rule.examples.length > 0 && (
              <ul className={classes.examples}>
                {rule.examples.map((example) => (
                  <li className={classes.example} key={example}>
                    {example}
                  </li>
                ))}
              </ul>
            )}
            <div className={classes.cardActions}>
              <button
                className={clsx("btn btn-small", classes.editButton)}
                type="button"
                onClick={() => handleEditRule(rule)}
              >
                Редактировать
              </button>
              <button
                className={classes.deleteButton}
                type="button"
                aria-label={`Удалить правило ${rule.title}`}
                title="Удалить правило"
                onClick={() => handleDeleteRule(rule.id)}
              >
                <DeleteOutlined />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMemo, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import { Button } from "../../components/Button";
import { Checkbox } from "../../components/Checkbox";
import { IconButton } from "../../components/IconButton";
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState<TEnglishRulePayload>(createEmptyRuleForm);
  const [examplesText, setExamplesText] = useState("");
  const pageRef = useRef<HTMLElement | null>(null);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => categoryFilters[rule.category]);
  }, [rules, categoryFilters]);

  const isEditMode = editingRuleId !== null;
  const isSubmitLoading = isAddRuleLoading || isUpdateRuleLoading;

  const resetForm = () => {
    setEditingRuleId(null);
    setIsFormOpen(false);
    setRuleForm(createEmptyRuleForm());
    setExamplesText("");
  };

  const handleEditRule = (rule: TEnglishRule) => {
    setIsFormOpen(true);
    setEditingRuleId(rule.id);
    setRuleForm({
      category: rule.category,
      description: rule.description,
      examples: rule.examples,
      title: rule.title,
    });
    setExamplesText(rule.examples.join("\n"));

    requestAnimationFrame(() => {
      pageRef.current?.scrollTo({
        behavior: "smooth",
        top: 0,
      });
    });
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
    <section ref={pageRef} className={clsx(classes.page, { [classes.pageWithForm]: isFormOpen })}>
      <div className={classes.header}>
        <div className={classes.rules}>
          <h2 className={classes.title}>Правила</h2>
          {!isFormOpen && (
            <Button
              className={classes.addRuleButton}
              variant="secondary"
              size="small"
              onClick={() => setIsFormOpen(true)}
            >
              Добавить правило
            </Button>
          )}
        </div>
        <p className={classes.footnote}>
          Стартовые правила сгенерированы нейросетью. Проверяйте и адаптируйте их
          под свой способ обучения.
        </p>
      </div>


      {isFormOpen && (
        <form className={classes.form} onSubmit={handleSubmitRule}>
          <IconButton
            className={classes.closeForm}
            variant="surface"
            size="medium"
            aria-label="Закрыть форму правила"
            onClick={resetForm}
          >
            <CloseOutlined />
          </IconButton>
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
            <Button
              className={classes.submitButton}
              variant="secondary"
              type="submit"
              disabled={isSubmitLoading}
            >
              {isEditMode ? "Сохранить правило" : "Добавить правило"}
            </Button>
          </div>
        </form>
      )}


      <div className={clsx(classes.filterList, { [classes.hiddenOnMobileForm]: isFormOpen })}>
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

      {isRulesFetching && <p className={classes.empty}>Загружаю правила...</p>}

      {!isRulesFetching && filteredRules.length === 0 && (
        <p className={classes.empty}>Выбери хотя бы одну категорию правил.</p>
      )}

      <div className={clsx(classes.grid, { [classes.hiddenOnMobileForm]: isFormOpen })}>
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
              <Button
                className={classes.editButton}
                variant="plain"
                size="small"
                onClick={() => handleEditRule(rule)}
              >
                Редактировать
              </Button>
              <IconButton
                className={classes.deleteButton}
                variant="danger"
                size="medium"
                aria-label={`Удалить правило ${rule.title}`}
                title="Удалить правило"
                onClick={() => handleDeleteRule(rule.id)}
              >
                <DeleteOutlined />
              </IconButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

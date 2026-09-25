import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const SubjectFilterBar = ({ options = [], value = "", onChange, onSearch }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const selectedLabel =
    value === "" || value == null
      ? "All Subjects"
      : options.find((item) => String(item.id) === String(value))?.name ||
        "All Subjects";

  const handlePick = (nextValue) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  return (
    <>
      <div className="diary-page__filters-bar">
        <button
          type="button"
          className="diary-page__select-trigger"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="diary-page__select-trigger-text">{selectedLabel}</span>
          <Icon
            icon="solar:alt-arrow-down-bold"
            className="diary-page__select-trigger-caret"
            aria-hidden
          />
        </button>
        <button
          type="button"
          className="btn diary-page__search-btn"
          onClick={onSearch}
        >
          Search
        </button>
      </div>

      {open ? (
        <div
          className="diary-subject-modal"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="diary-subject-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Select subject"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="diary-subject-modal__header">
              <h5 className="diary-subject-modal__title">Select Subject</h5>
              <button
                type="button"
                className="diary-subject-modal__close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <Icon icon="solar:close-circle-bold" width={22} />
              </button>
            </div>

            <div
              className="diary-subject-modal__list"
              role="radiogroup"
              aria-label="Subjects"
            >
              <label className="diary-subject-modal__option">
                <input
                  type="radio"
                  name="diary-subject-filter"
                  checked={value === "" || value == null}
                  onChange={() => handlePick("")}
                />
                <span className="diary-subject-modal__radio" aria-hidden />
                <span className="diary-subject-modal__label">All Subjects</span>
              </label>

              {options.map(({ id, name }) => (
                <label className="diary-subject-modal__option" key={id}>
                  <input
                    type="radio"
                    name="diary-subject-filter"
                    checked={String(value) === String(id)}
                    onChange={() => handlePick(String(id))}
                  />
                  <span className="diary-subject-modal__radio" aria-hidden />
                  <span className="diary-subject-modal__label">
                    {name || "—"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SubjectFilterBar;

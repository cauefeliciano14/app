import React from "react";
import backgroundsData from "../../data/backgrounds.json";
import talentsData from "../../data/talents.json";
import {
  TalentChoiceSection,
  checkTalentComplete,
  countVisibleTalentChoices,
} from "../TalentChoices";
import { ToolProficiencyCard } from "../ToolProficiencyCard";
import { ValidationBanner } from "../ValidationBanner";
import { StepLayout } from "./StepLayout";
import styles from "./StepLayout.module.css";
import { formatDice, getSkillParts } from "../../utils/formatting";
import { useCharacter, ATTR_METADATA } from "../../context/CharacterContext";
import { useWizard } from "../../context/WizardContext";

export const BackgroundStep: React.FC = () => {
  const {
    character,
    setCharacter,
    selectedBackground,
    setSelectedBackground,
    attrChoiceMode,
    setAttrChoiceMode,
    attrPlus1,
    setAttrPlus1,
    attrPlus2,
    setAttrPlus2,
    handleChoiceChange,
    handleTalentSelectionChange,
    allSelections,
    stepSelections,
    validationResult,
  } = useCharacter();

  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const validationErrors = validationResult.byStep.background;
  const canAdvance = validationErrors.length === 0;

  return (
    <StepLayout
      onPrev={() => setCurrentStep(0)}
      onNext={() => setCurrentStep(2)}
      canAdvance={canAdvance}
      activeStep={2}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(n: string) =>
        setCharacter((prev) => ({ ...prev, name: n }))
      }
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      selections={stepSelections}
    >
      <div className={styles.stepContent}>
        <ValidationBanner errors={validationErrors} />
        <div className={styles.sectionIntro}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionIcon}>✦</span>
            <span>Escolha sua Origem: Antecedente</span>
          </div>
          <p className={styles.sectionDescription}>
            O antecedente do seu personagem reúne vivências, ofício e repertório social. Escolha um pacote para definir o passado e visualizar os benefícios essenciais sem depender de um layout excessivamente vertical.
          </p>
        </div>

        <div className={styles.selectionLayout}>
          <div className={styles.selectionRail}>
            {(backgroundsData.backgrounds as any[]).map((bg: any) => {
              const isSelected = selectedBackground?.id === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  className={`${styles.selectionButton} ${isSelected ? styles.selectionButtonActive : ""}`.trim()}
                  onClick={() => {
                    setSelectedBackground(bg);
                    window.scrollTo(0, 0);
                    setAttrChoiceMode("");
                    setAttrPlus1("");
                    setAttrPlus2("");
                    setCharacter((prev) => ({
                      ...prev,
                      choices: { ...prev.choices, toolProficiency: "" },
                    }));
                  }}
                >
                  <span className={styles.selectionButtonName}>{bg.name}</span>
                  <span className={styles.selectionButtonMarker}>{isSelected ? 'Selecionada' : 'Ver'}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.selectionDetails}>
            {selectedBackground ? (
              <div id="background-details" className={styles.selectionDetails}>
                {/* Info Card */}
                <div
                  style={{
                    background: "rgba(17, 18, 24, 0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      color: "#fff",
                      fontSize: "1.5rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {selectedBackground.name}
                  </h3>
                  <p
                    style={{
                      color: "#cbd5e1",
                      fontSize: "0.9rem",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedBackground.description}
                  </p>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      margin: "8px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(249,115,22,0.05)",
                        border: "1px solid rgba(249,115,22,0.15)",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          color: "#f97316",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Proficiências em Perícias
                      </span>
                      <span
                        style={{
                          color: "#e2e8f0",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        {selectedBackground.skillProficiencies.map(
                          (s: string) => {
                            const { name, attr } = getSkillParts(s);
                            return (
                              <span
                                key={s}
                                style={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  gap: "4px",
                                }}
                              >
                                <strong style={{ color: "#f97316" }}>
                                  {name}
                                </strong>
                                {attr && (
                                  <span
                                    style={{
                                      opacity: 0.5,
                                      fontSize: "0.75rem",
                                      fontWeight: 400,
                                    }}
                                  >
                                    ({attr})
                                  </span>
                                )}
                              </span>
                            );
                          },
                        )}
                      </span>
                    </div>
                    <ToolProficiencyCard
                      selectedBackground={selectedBackground}
                      toolChoice={character.choices["toolProficiency"] || ""}
                      onToolChoiceChange={(val) =>
                        handleChoiceChange("toolProficiency", val)
                      }
                    />
                  </div>
                </div>

                {/* Accordions: Talent + Attribute side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', alignItems: 'start' }}>

                {/* Talent Accordion */}
                {(() => {
                  const talent = (talentsData.talents as any[]).find(
                    (t: any) =>
                      selectedBackground.talent === t.name ||
                      selectedBackground.talent.startsWith(t.name),
                  );
                  const isTalentChoicesComplete = checkTalentComplete(
                    selectedBackground.talent,
                    character.talentSelections[selectedBackground.talent],
                  );
                  return (
                    <details
                      style={{
                        background: "rgba(17, 18, 24, 0.6)",
                        backdropFilter: "blur(8px)",
                        border: isTalentChoicesComplete
                          ? "1px solid rgba(255,255,255,0.07)"
                          : "1px solid rgba(249,115,22,0.5)",
                        borderRadius: "10px",
                      }}
                    >
                      <summary
                        style={{
                          padding: "12px 18px",
                          cursor: "pointer",
                          listStyle: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          userSelect: "none",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {!isTalentChoicesComplete && (
                            <span
                              title="Ação necessária no talento de origem"
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "#f97316",
                                color: "#000",
                                fontWeight: 900,
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              !
                            </span>
                          )}
                          <span>
                            <span
                              style={{
                                color: "#f1f5f9",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                display: "block",
                              }}
                            >
                              {selectedBackground.talent}
                            </span>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                lineHeight: 1,
                                display: "block",
                              }}
                            >
                              {(() => {
                                const visible = countVisibleTalentChoices(
                                  selectedBackground.talent,
                                  character.talentSelections[
                                    selectedBackground.talent
                                  ],
                                );
                                return visible > 0 ? (
                                  <span
                                    style={{
                                      color: isTalentChoicesComplete
                                        ? "#64748b"
                                        : "#f97316",
                                    }}
                                  >
                                    {visible} Escolha{visible > 1 ? "s" : ""} —
                                  </span>
                                ) : null;
                              })()}
                              <span style={{ color: "#64748b" }}>
                                Talento de Origem
                              </span>
                            </span>
                          </span>
                        </span>
                        <span
                          className="summary-chevron"
                          style={{
                            color: "#f97316",
                            fontSize: "0.8rem",
                            opacity: 0.7,
                          }}
                        >
                          ▼
                        </span>
                      </summary>
                      <div
                        style={{
                          padding: "0 18px 14px 18px",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <p
                          style={{
                            color: "#64748b",
                            fontStyle: "italic",
                            fontSize: "0.8rem",
                            margin: "10px 0 8px 0",
                          }}
                        >
                          Benefícios do Talento
                        </p>
                        {talent &&
                          talent.benefits.map((b: string, i: number) => {
                            let boldPart = "";
                            let restText = b;

                            if (b.includes(": ")) {
                              const splitIndex = b.indexOf(": ");
                              boldPart = b.substring(0, splitIndex + 1);
                              restText = b.substring(splitIndex + 2);
                            } else if (b.includes(". ")) {
                              const splitIndex = b.indexOf(". ");
                              boldPart = b.substring(0, splitIndex + 1);
                              restText = b.substring(splitIndex + 2);
                            }

                            return (
                              <p
                                key={i}
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "0.85rem",
                                  margin: "4px 0",
                                  lineHeight: 1.6,
                                }}
                              >
                                {boldPart ? (
                                  <>
                                    <strong
                                      style={{
                                        color: "#e2e8f0",
                                        fontStyle: "italic",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {boldPart}
                                    </strong>{" "}
                                    {formatDice(restText)}
                                  </>
                                ) : (
                                  formatDice(b)
                                )}
                              </p>
                            );
                          })}

                        <TalentChoiceSection
                          talentName={selectedBackground.talent}
                          selections={
                            character.talentSelections[
                              selectedBackground.talent
                            ] || {}
                          }
                          onChange={(sels) =>
                            handleTalentSelectionChange(
                              selectedBackground.talent,
                              sels,
                            )
                          }
                          allSelections={allSelections}
                        />
                      </div>
                    </details>
                  );
                })()}

                {/* Attribute Points Accordion */}
                <details
                  style={{
                    background: "rgba(17, 18, 24, 0.6)",
                    backdropFilter: "blur(8px)",
                    border:
                      attrChoiceMode &&
                      (attrChoiceMode === "triple" || (attrPlus1 && attrPlus2))
                        ? "1px solid rgba(255,255,255,0.07)"
                        : "1px solid rgba(249,115,22,0.5)",
                    borderRadius: "10px",
                  }}
                >
                  <summary
                    style={{
                      padding: "12px 18px",
                      cursor: "pointer",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {!(
                        attrChoiceMode &&
                        (attrChoiceMode === "triple" ||
                          (attrPlus1 && attrPlus2))
                      ) && (
                        <span
                          title="Escolha seu bônus de atributo"
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#f97316",
                            color: "#000",
                            fontWeight: 900,
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          !
                        </span>
                      )}
                      <span>
                        <span
                          style={{
                            color: "#f1f5f9",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            display: "block",
                          }}
                        >
                          Bônus de Atributo
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            lineHeight: 1,
                            display: "block",
                          }}
                        >
                          <span
                            style={{
                              color:
                                attrChoiceMode &&
                                (attrChoiceMode === "triple" ||
                                  (attrPlus1 && attrPlus2))
                                  ? "#64748b"
                                  : "#f97316",
                            }}
                          >
                            1 Escolha —{" "}
                          </span>
                          <span style={{ color: "#64748b" }}>Antecedente</span>
                        </span>
                      </span>
                    </span>
                    <span
                      className="summary-chevron"
                      style={{
                        color: "#f97316",
                        fontSize: "0.8rem",
                        opacity: 0.7,
                      }}
                    >
                      ▼
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: "24px 32px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                        margin: "0 0 16px 0",
                        lineHeight: 1.6,
                      }}
                    >
                      O Antecedente{" "}
                      <strong style={{ color: "#f1f5f9" }}>
                        {selectedBackground.name}
                      </strong>{" "}
                      permite que você aumente atributos específicos. Nenhum
                      aumento pode elevar um atributo acima de 20.
                    </p>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          color: "#e2e8f0",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Padrão de Bônus:
                      </label>
                      <select
                        className="premium-select"
                        value={attrChoiceMode}
                        onChange={(e) => {
                          setAttrChoiceMode(
                            e.target.value as "" | "triple" | "double",
                          );
                          setAttrPlus1("");
                          setAttrPlus2("");
                        }}
                      >
                        <option value="">— Escolher uma opção —</option>
                        <option value="triple">
                          Três atributos: +1, +1, +1
                        </option>
                        <option value="double">Dois atributos: +2, +1</option>
                      </select>
                    </div>

                    {attrChoiceMode === "triple" && (
                      <div
                        style={{
                          padding: "12px",
                          background: "rgba(249,115,22,0.05)",
                          border: "1px solid rgba(249,115,22,0.2)",
                          borderRadius: "8px",
                        }}
                      >
                        <p
                          style={{
                            color: "#f1f5f9",
                            fontSize: "0.85rem",
                            margin: 0,
                          }}
                        >
                          <span
                            style={{ color: "#f97316", fontWeight: "bold" }}
                          >
                            ✓ Aplicado:
                          </span>{" "}
                          +1 em{" "}
                          <strong style={{ color: "#fff" }}>
                            {selectedBackground.attributeValues
                              .map((a: string) => ATTR_METADATA[a]?.full || a)
                              .join(", ")}
                          </strong>
                          .
                        </p>
                      </div>
                    )}

                    {attrChoiceMode === "double" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: "180px" }}>
                            <label
                              style={{
                                color: "#94a3b8",
                                fontSize: "0.78rem",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              Atributo para{" "}
                              <span
                                style={{ color: "#f97316", fontWeight: "bold" }}
                              >
                                +1
                              </span>
                              :
                            </label>
                            <select
                              className="premium-select"
                              value={attrPlus1}
                              onChange={(e) => setAttrPlus1(e.target.value)}
                            >
                              <option value="">— Escolha —</option>
                              {selectedBackground.attributeValues.map(
                                (a: string) => (
                                  <option
                                    key={a}
                                    value={a}
                                    disabled={a === attrPlus2}
                                    className={
                                      a === attrPlus2 ? "option-taken" : ""
                                    }
                                  >
                                    {a === attrPlus2 ? "✓ " : ""}
                                    {ATTR_METADATA[a]?.full || a}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: "180px" }}>
                            <label
                              style={{
                                color: "#94a3b8",
                                fontSize: "0.78rem",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              Atributo para{" "}
                              <span
                                style={{ color: "#f97316", fontWeight: "bold" }}
                              >
                                +2
                              </span>
                              :
                            </label>
                            <select
                              className="premium-select"
                              value={attrPlus2}
                              onChange={(e) => setAttrPlus2(e.target.value)}
                            >
                              <option value="">— Escolha —</option>
                              {selectedBackground.attributeValues.map(
                                (a: string) => (
                                  <option
                                    key={a}
                                    value={a}
                                    disabled={a === attrPlus1}
                                    className={
                                      a === attrPlus1 ? "option-taken" : ""
                                    }
                                  >
                                    {a === attrPlus1 ? "✓ " : ""}
                                    {ATTR_METADATA[a]?.full || a}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>

                </div>{/* end side-by-side grid */}
              </div>
            ) : (
              <div className={styles.selectionPlaceholder}>
                <span
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "12px",
                    opacity: 0.5,
                  }}
                >
                  📖
                </span>
                <p style={{ margin: 0 }}>
                  Selecione um antecedente para ver os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

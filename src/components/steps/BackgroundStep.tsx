import React, { useRef } from "react";
import backgroundsData from "../../data/backgrounds.json";
import talentsData from "../../data/talents.json";
import {
  TalentChoiceSection,
  checkTalentComplete,
  countVisibleTalentChoices,
} from "../TalentChoices";
import { ToolProficiencyCard } from "../ToolProficiencyCard";
import { StepLayout } from "./StepLayout";
import styles from "./StepLayout.module.css";
import bgStyles from "./BackgroundStep.module.css";
import { formatDice, getSkillParts } from "../../utils/formatting";
import { useCharacter, ATTR_METADATA } from "../../context/CharacterContext";
import { useWizard } from "../../context/WizardContext";

export const BackgroundStep: React.FC = () => {
  const detailsRef = useRef<HTMLDivElement | null>(null);

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
      characterName={character.name}
      setCharacterName={(n: string) =>
        setCharacter((prev) => ({ ...prev, name: n }))
      }
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      impactSection="background"
    >
      <div className={styles.stepContent}>
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
                    requestAnimationFrame(() => {
                      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    });
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
                  {isSelected && <span className={styles.selectionButtonMarker}>✓</span>}
                </button>
              );
            })}
          </div>

          <div className={styles.selectionDetails} ref={detailsRef}>
            {selectedBackground ? (
              <div id="background-details" className={styles.selectionDetails}>
                <div className={`${styles.summaryCardBase} ${styles.selectionPanel} ${bgStyles.detailsCard}`}>
                  <div className={bgStyles.detailsHeading}>
                    <h3 className={bgStyles.detailsTitle}>
                      {selectedBackground.name}
                    </h3>
                    <p className={bgStyles.detailsDescription}>
                      {selectedBackground.description}
                    </p>
                  </div>
                  <hr className={bgStyles.detailsDivider} />
                  <div className={bgStyles.detailsGrid}>
                    <div className={bgStyles.metaCard}>
                      <span className={bgStyles.metaCardLabel}>
                        Proficiências em Perícias
                      </span>
                      <span className={bgStyles.skillList}>
                        {selectedBackground.skillProficiencies.map(
                          (s: string) => {
                            const { name, attr } = getSkillParts(s);
                            return (
                              <span key={s} className={bgStyles.skillItem}>
                                <strong className={bgStyles.skillName}>
                                  {name}
                                </strong>
                                {attr && (
                                  <span className={bgStyles.skillAttr}>
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

                <div className={bgStyles.accordionGrid}>

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
                      className={`${bgStyles.accordion} ${!isTalentChoicesComplete ? bgStyles.accordionIncomplete : ""}`.trim()}
                    >
                      <summary className={bgStyles.accordionSummary}>
                        <span className={bgStyles.summaryLead}>
                          {!isTalentChoicesComplete && (
                            <span
                              title="Ação necessária no talento de origem"
                              className={bgStyles.alertBadge}
                            >
                              !
                            </span>
                          )}
                          <span className={bgStyles.summaryText}>
                            <span className={bgStyles.summaryTitle}>
                              {selectedBackground.talent}
                            </span>
                            <span className={bgStyles.summaryMeta}>
                              {(() => {
                                const visible = countVisibleTalentChoices(
                                  selectedBackground.talent,
                                  character.talentSelections[
                                    selectedBackground.talent
                                  ],
                                );
                                return visible > 0 ? (
                                  <span
                                    className={
                                      isTalentChoicesComplete
                                        ? bgStyles.summaryMetaMuted
                                        : bgStyles.summaryMetaAccent
                                    }
                                  >
                                    {visible} Escolha{visible > 1 ? "s" : ""} —
                                  </span>
                                ) : null;
                              })()}
                              <span className={bgStyles.summaryMetaMuted}>
                                Talento de Origem
                              </span>
                            </span>
                          </span>
                        </span>
                        <span
                          className={`summary-chevron ${bgStyles.summaryChevron}`}
                        >
                          ▼
                        </span>
                      </summary>
                      <div className={bgStyles.accordionBody}>
                        <p className={bgStyles.benefitsLabel}>
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
                              <p key={i} className={bgStyles.benefitText}>
                                {boldPart ? (
                                  <>
                                    <strong className={bgStyles.benefitStrong}>
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
                  className={`${bgStyles.accordion} ${
                    attrChoiceMode &&
                    (attrChoiceMode === "triple" || (attrPlus1 && attrPlus2))
                      ? ""
                      : bgStyles.accordionIncomplete
                  }`.trim()}
                >
                  <summary className={bgStyles.accordionSummary}>
                    <span className={bgStyles.summaryLead}>
                      {!(
                        attrChoiceMode &&
                        (attrChoiceMode === "triple" ||
                          (attrPlus1 && attrPlus2))
                      ) && (
                        <span
                          title="Escolha seu bônus de atributo"
                          className={bgStyles.alertBadge}
                        >
                          !
                        </span>
                      )}
                      <span className={bgStyles.summaryText}>
                        <span className={bgStyles.summaryTitle}>
                          Bônus de Atributo
                        </span>
                        <span className={bgStyles.summaryMeta}>
                          <span
                            className={
                              attrChoiceMode &&
                              (attrChoiceMode === "triple" ||
                                (attrPlus1 && attrPlus2))
                                ? bgStyles.summaryMetaMuted
                                : bgStyles.summaryMetaAccent
                            }
                          >
                            1 Escolha —{" "}
                          </span>
                          <span className={bgStyles.summaryMetaMuted}>
                            Antecedente
                          </span>
                        </span>
                      </span>
                    </span>
                    <span
                      className={`summary-chevron ${bgStyles.summaryChevron}`}
                    >
                      ▼
                    </span>
                  </summary>
                  <div className={bgStyles.attributeBody}>
                    <p className={bgStyles.attributeDescription}>
                      O Antecedente{" "}
                      <strong className={bgStyles.attributeNameStrong}>
                        {selectedBackground.name}
                      </strong>{" "}
                      permite que você aumente atributos específicos. Nenhum
                      aumento pode elevar um atributo acima de 20.
                    </p>

                    <div className={bgStyles.fieldBlock}>
                      <label className={bgStyles.fieldLabel}>
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
                      <div className={bgStyles.appliedBonusCard}>
                        <p className={bgStyles.appliedBonusText}>
                          <span className={bgStyles.appliedBonusHighlight}>
                            ✓ Aplicado:
                          </span>{" "}
                          +1 em{" "}
                          <strong className={bgStyles.appliedBonusStrong}>
                            {selectedBackground.attributeValues
                              .map((a: string) => ATTR_METADATA[a]?.full || a)
                              .join(", ")}
                          </strong>
                          .
                        </p>
                      </div>
                    )}

                    {attrChoiceMode === "double" && (
                      <div className={bgStyles.selectFields}>
                        <div className={bgStyles.selectGrid}>
                          <div className={bgStyles.selectField}>
                            <label className={bgStyles.selectLabel}>
                              Atributo para{" "}
                              <span className={bgStyles.selectValueAccent}>+1</span>
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
                          <div className={bgStyles.selectField}>
                            <label className={bgStyles.selectLabel}>
                              Atributo para{" "}
                              <span className={bgStyles.selectValueAccent}>+2</span>
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

                </div>
              </div>
            ) : (
              <div className={`${styles.selectionPlaceholder} ${styles.placeholderPanel}`}>
                <span className={bgStyles.placeholderIcon}>📖</span>
                <p className={bgStyles.placeholderText}>
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

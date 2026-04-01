// @ts-nocheck
import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, RotateCcw, CheckCircle2, XCircle,
  GraduationCap, ClipboardCheck, Lightbulb, BookOpen,
  Timer as TimerIcon, Volume2, VolumeX, SkipForward, FlaskConical,
  AlertTriangle, HelpCircle, Eye, ArrowRight, Wrench, Beaker
} from "lucide-react";
import {
  playPourSound, playSuccessSound, playErrorSound, playTickSound,
  playTimerCompleteSound, playCompletionFanfare
} from "@/lib/labSoundEffects";

export interface SimInstrument {
  key: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface SimStep {
  id: number;
  title: string;
  description: string;
  duration: number;
  principle: string;
  hint: string;
  mentorTip: string;
  reference: string;
  requiredInstrument?: string;
  instruments?: SimInstrument[];
  quiz?: { question: string; correct: number; options: string[] };
}

interface SimulatorShellProps {
  title: string;
  icon: ReactNode;
  references: string[];
  steps: SimStep[];
  instruments?: SimInstrument[];
  children: (props: { currentStep: number; isTimerActive: boolean; completed: boolean; selectedInstrument: string | null }) => ReactNode;
  renderResults?: () => ReactNode;
}

function StepTimer({ duration, onComplete, onSkip, soundEnabled }: {
  duration: number; onComplete: () => void; onSkip: () => void; soundEnabled: boolean;
}) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(duration);
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r - 1 <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (soundEnabled) try { playTimerCompleteSound(); } catch {}
          onComplete();
          return 0;
        }
        if (r - 1 <= 5 && soundEnabled) try { playTickSound(); } catch {};
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [duration, onComplete, soundEnabled]);

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(0);
    if (soundEnabled) try { playTimerCompleteSound(); } catch {}
    onSkip();
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <TimerIcon className="h-4 w-4 text-primary animate-pulse" />
      <div className="flex-1">
        <Progress value={((duration - remaining) / duration) * 100} className="h-1.5" />
      </div>
      <span className="text-sm font-mono font-bold tabular-nums">{remaining}s</span>
      <Button size="sm" variant="outline" onClick={handleSkip} className="gap-1 text-xs h-7">
        <SkipForward className="h-3 w-3" /> Skip
      </Button>
    </div>
  );
}

export function SimulatorShell({ title, icon, references, steps, instruments: globalInstruments, children, renderResults }: SimulatorShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [mode, setMode] = useState<"learning" | "exam" | "free">("learning");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showPrinciple, setShowPrinciple] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [instrumentValidated, setInstrumentValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAutoHint, setShowAutoHint] = useState(false);
  const [hintTimer, setHintTimer] = useState(0);
  const hintIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stepActionDone, setStepActionDone] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep) / steps.length) * 100;
  const hasInstrumentRequirement = step?.requiredInstrument && (globalInstruments?.length || step?.instruments?.length);
  const availableInstruments = step?.instruments || globalInstruments || [];

  // Auto-hint timer: show hint after 15s of inactivity
  useEffect(() => {
    setShowAutoHint(false);
    setHintTimer(0);
    if (completed || isTimerActive || quizActive || stepActionDone) return;

    hintIntervalRef.current = setInterval(() => {
      setHintTimer(prev => {
        if (prev >= 15) {
          setShowAutoHint(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => { if (hintIntervalRef.current) clearInterval(hintIntervalRef.current); };
  }, [currentStep, completed, isTimerActive, quizActive, stepActionDone]);

  // Reset hint timer on any interaction
  const resetHintTimer = useCallback(() => {
    setHintTimer(0);
    setShowAutoHint(false);
  }, []);

  const handleInstrumentSelect = useCallback((instrumentKey: string) => {
    resetHintTimer();
    setErrorMessage(null);

    if (!step?.requiredInstrument) {
      setSelectedInstrument(instrumentKey);
      return;
    }

    if (instrumentKey === step.requiredInstrument) {
      setSelectedInstrument(instrumentKey);
      setInstrumentValidated(true);
      setScore(prev => prev + 5);
      if (soundEnabled) try { playSuccessSound(); } catch {}
    } else {
      setErrors(prev => prev + 1);
      if (soundEnabled) try { playErrorSound(); } catch {}
      const correctInstrument = availableInstruments.find(i => i.key === step.requiredInstrument);
      setErrorMessage(
        mode === "learning"
          ? `❌ Incorrect instrument. Please use "${correctInstrument?.label || step.requiredInstrument}".`
          : `❌ Wrong instrument!`
      );
      setTimeout(() => setErrorMessage(null), 3000);
    }
  }, [step, mode, soundEnabled, availableInstruments, resetHintTimer]);

  const handleStepComplete = useCallback(() => {
    setIsTimerActive(false);
    setScore(prev => prev + 10);
    setStepActionDone(true);
    if (soundEnabled) try { playSuccessSound(); } catch {}

    if (step?.quiz && !quizAnswered) {
      setQuizActive(true);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setQuizAnswered(false);
      setQuizActive(false);
      setSelectedAnswer(null);
      setShowPrinciple(false);
      setSelectedInstrument(null);
      setInstrumentValidated(false);
      setStepActionDone(false);
      setErrorMessage(null);
    } else {
      setCompleted(true);
      if (soundEnabled) try { playCompletionFanfare(); } catch {}
    }
  }, [currentStep, step, quizAnswered, soundEnabled, steps.length]);

  const handleStartStep = useCallback(() => {
    resetHintTimer();
    if (soundEnabled) try { playPourSound(); } catch {}

    // If instrument required and not validated, show error
    if (hasInstrumentRequirement && !instrumentValidated && mode !== "free") {
      setErrorMessage("⚠️ Select the correct instrument first!");
      if (soundEnabled) try { playErrorSound(); } catch {}
      return;
    }

    if (step.duration > 0) {
      setIsTimerActive(true);
    } else {
      handleStepComplete();
    }
  }, [step, handleStepComplete, soundEnabled, hasInstrumentRequirement, instrumentValidated, mode, resetHintTimer]);

  const handleAutoComplete = useCallback(() => {
    // Auto-complete for stuck users
    resetHintTimer();
    if (hasInstrumentRequirement && !instrumentValidated) {
      setSelectedInstrument(step.requiredInstrument!);
      setInstrumentValidated(true);
    }
    if (step.duration > 0) {
      setIsTimerActive(false);
      setStepActionDone(true);
    }
    handleStepComplete();
  }, [step, hasInstrumentRequirement, instrumentValidated, handleStepComplete, resetHintTimer]);

  const handleQuizAnswer = (index: number) => {
    resetHintTimer();
    setSelectedAnswer(index);
    setQuizAnswered(true);
    const isCorrect = index === step.quiz!.correct;
    if (isCorrect) {
      setScore(prev => prev + 5);
      if (soundEnabled) try { playSuccessSound(); } catch {}
    } else {
      setErrors(prev => prev + 1);
      if (soundEnabled) try { playErrorSound(); } catch {}
    }
  };

  const handleQuizContinue = () => {
    setQuizActive(false);
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setShowPrinciple(false);
    setSelectedInstrument(null);
    setInstrumentValidated(false);
    setStepActionDone(false);
    setErrorMessage(null);
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
      if (soundEnabled) try { playCompletionFanfare(); } catch {}
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsTimerActive(false);
    setCompleted(false);
    setScore(0);
    setErrors(0);
    setQuizActive(false);
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setShowPrinciple(false);
    setSelectedInstrument(null);
    setInstrumentValidated(false);
    setStepActionDone(false);
    setErrorMessage(null);
    setShowAutoHint(false);
  };

  const maxScore = steps.length * 10 + steps.filter(s => s.quiz).length * 5 + steps.filter(s => s.requiredInstrument).length * 5;
  const gradePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const grade = gradePercent >= 90 ? "Excellent" : gradePercent >= 70 ? "Good" : gradePercent >= 50 ? "Needs Improvement" : "Retake";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon}
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {(["learning", "exam", "free"] as const).map(m => (
                <Badge
                  key={m}
                  variant={mode === m ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => { setMode(m); handleReset(); }}
                >
                  {m === "learning" && <GraduationCap className="h-3 w-3 mr-1" />}
                  {m === "exam" && <ClipboardCheck className="h-3 w-3 mr-1" />}
                  {m === "free" && <Eye className="h-3 w-3 mr-1" />}
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Badge>
              ))}
              <Button
                size="sm" variant="ghost"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-7 w-7 p-0"
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {references.map(ref => (
              <Badge key={ref} variant="outline" className="text-[10px]">{ref}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={progress} className="flex-1 h-1.5" />
            <span className="text-xs font-medium text-muted-foreground">{currentStep}/{steps.length}</span>
            <Badge variant="outline" className="text-[10px]">Score: {score}</Badge>
            {errors > 0 && <Badge variant="destructive" className="text-[10px]">Errors: {errors}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            {/* 3D Canvas area */}
            <div className="h-[400px] rounded-lg overflow-hidden border bg-gradient-to-b from-muted/30 to-muted/10 relative">
              {children({ currentStep, isTimerActive, completed, selectedInstrument })}
              
              {/* Guided mode overlay arrow */}
              {mode === "learning" && hasInstrumentRequirement && !instrumentValidated && !completed && (
                <div className="absolute top-3 left-3 right-3">
                  <div className="p-2 rounded-lg bg-primary/90 text-primary-foreground text-xs flex items-center gap-2 animate-pulse">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    Select <strong>{availableInstruments.find(i => i.key === step.requiredInstrument)?.label || step.requiredInstrument}</strong> from the instrument panel →
                  </div>
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="space-y-3">
              {/* Instrument Panel */}
              {availableInstruments.length > 0 && !completed && (
                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Instruments & Reagents</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {availableInstruments.map(inst => {
                      const isRequired = step?.requiredInstrument === inst.key;
                      const isSelected = selectedInstrument === inst.key;
                      const isValidated = isSelected && instrumentValidated;
                      return (
                        <button
                          key={inst.key}
                          onClick={() => handleInstrumentSelect(inst.key)}
                          disabled={instrumentValidated || stepActionDone || isTimerActive}
                          className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border transition-all ${
                            isValidated
                              ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                              : isSelected
                              ? "border-primary bg-primary/10 font-semibold"
                              : isRequired && mode === "learning" && showAutoHint
                              ? "border-primary bg-primary/20 animate-pulse font-semibold"
                              : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                          } ${(instrumentValidated || stepActionDone) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div
                            className="w-3 h-3 rounded-full border shrink-0"
                            style={{ backgroundColor: inst.color || "#888" }}
                          />
                          {inst.label}
                          {isValidated && <CheckCircle2 className="h-2.5 w-2.5 text-green-500 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step info */}
              {!completed && step && (
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      Step {step.id}/{steps.length}
                    </Badge>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                  </div>
                  {mode === "learning" && (
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  )}
                  {mode === "exam" && (
                    <p className="text-sm text-muted-foreground italic">{step.hint}</p>
                  )}
                  {mode === "free" && (
                    <p className="text-sm text-muted-foreground">{step.title} — perform this step freely.</p>
                  )}
                </div>
              )}

              {/* Principle panel (learning mode) */}
              {mode === "learning" && !completed && step && (
                <div className="space-y-2">
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => { setShowPrinciple(!showPrinciple); resetHintTimer(); }}
                    className="gap-1.5 text-xs h-7"
                  >
                    <Lightbulb className="h-3 w-3" />
                    {showPrinciple ? "Hide Principle" : "Show Principle"}
                  </Button>
                  <AnimatePresence>
                    {showPrinciple && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-2">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">{step.principle}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <GraduationCap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">{step.mentorTip}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground italic">📚 {step.reference}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Auto-hint for stuck users */}
              <AnimatePresence>
                {showAutoHint && !completed && !isTimerActive && !quizActive && !stepActionDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Need help? Here's a hint:
                    </div>
                    <p className="text-xs text-muted-foreground">{step.hint}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      onClick={handleAutoComplete}
                    >
                      <SkipForward className="h-3 w-3" /> Auto-complete this step
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer */}
              {isTimerActive && step && (
                <StepTimer
                  key={currentStep}
                  duration={step.duration}
                  onComplete={handleStepComplete}
                  onSkip={handleStepComplete}
                  soundEnabled={soundEnabled}
                />
              )}

              {/* Quiz */}
              {quizActive && step?.quiz && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-3"
                >
                  <p className="text-sm font-medium">{step.quiz.question}</p>
                  <div className="space-y-2">
                    {step.quiz.options.map((opt, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant={selectedAnswer === null ? "outline" : i === step.quiz!.correct ? "default" : selectedAnswer === i ? "destructive" : "outline"}
                        className="w-full justify-start text-xs h-8"
                        onClick={() => !quizAnswered && handleQuizAnswer(i)}
                        disabled={quizAnswered}
                      >
                        {quizAnswered && i === step.quiz!.correct && <CheckCircle2 className="h-3 w-3 mr-1.5 text-green-500" />}
                        {quizAnswered && selectedAnswer === i && i !== step.quiz!.correct && <XCircle className="h-3 w-3 mr-1.5" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                  {quizAnswered && (
                    <Button size="sm" onClick={handleQuizContinue} className="w-full gap-1.5">
                      Continue <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Results */}
              {completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-bold">Experiment Complete!</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded bg-muted/50 border">
                      <p className="text-lg font-bold text-primary">{gradePercent}%</p>
                      <p className="text-[10px] text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/50 border">
                      <p className="text-sm font-bold">{grade}</p>
                      <p className="text-[10px] text-muted-foreground">Grade</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/50 border">
                      <p className="text-sm font-bold text-destructive">{errors}</p>
                      <p className="text-[10px] text-muted-foreground">Errors</p>
                    </div>
                  </div>
                  {errors === 0 && <p className="text-xs text-green-600 font-medium">🎉 Experiment Successful — No errors detected!</p>}
                  {errors > 0 && <p className="text-xs text-amber-600 font-medium">⚠️ {errors} error(s) detected — review the steps and retry for a better score.</p>}
                  {renderResults?.()}
                  <Button onClick={handleReset} size="sm" className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" /> Repeat Experiment
                  </Button>
                </motion.div>
              )}

              {/* Action buttons */}
              {!completed && !quizActive && !isTimerActive && (
                <div className="flex gap-2">
                  <Button onClick={handleStartStep} size="sm" className="gap-1.5 flex-1">
                    <FlaskConical className="h-3.5 w-3.5" />
                    {hasInstrumentRequirement && !instrumentValidated && mode !== "free"
                      ? "Select Instrument First"
                      : step?.duration > 0 ? "Perform Step" : "Complete Step"}
                  </Button>
                  <Button onClick={handleReset} size="sm" variant="ghost" className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              )}

              {/* Step list */}
              <div className="space-y-1 max-h-[160px] overflow-y-auto">
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    className={`text-xs p-2 rounded flex items-center gap-2 ${
                      i === currentStep && !completed
                        ? "bg-primary/10 text-primary font-medium"
                        : i < currentStep || completed
                        ? "text-muted-foreground line-through"
                        : "text-muted-foreground"
                    }`}
                  >
                    {i < currentStep || completed ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                    ) : (
                      <span className="w-3 text-center shrink-0">{s.id}</span>
                    )}
                    {s.title}
                    {s.requiredInstrument && <Wrench className="h-2.5 w-2.5 text-muted-foreground ml-auto shrink-0" />}
                    {s.quiz && <Badge variant="outline" className="text-[8px] ml-auto">Quiz</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

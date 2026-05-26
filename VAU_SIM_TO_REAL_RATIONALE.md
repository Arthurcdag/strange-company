# VAU Sim-to-Real Rationale

VAU is not a claim that the real world can be simulated accurately enough to
control directly. It is a decision-support loop for generating many possible
futures, selecting low-risk positive probes, observing reality, and pruning the
branches that reality disproves.

## Difficulty: Accurate Simulations Are Hard

Accurate simulations are hard because the real world has hidden state, changing
agents, measurement error, feedback loops, and legal or human constraints that
cannot be reduced to a clean game board.

VAU should therefore treat every model output as a hypothesis, not as proof.
The useful artifact is not "the prediction was exactly right." The useful
artifact is:

- a finite set of plausible futures,
- explicit assumptions and evidence gaps,
- positive actions that are safe across many futures,
- stop rules for branches that need real evidence,
- an observation loop that weakens or discards wrong futures.

The chess test is intentionally different: chess has exact rules and a finite
legal move set. It is a grounding fixture for LLM/AI developers, not evidence
that company or market simulations can be exact.

## Sim-to-Real Transfer

VAU should not transfer raw simulated outcomes into the real world. It should
transfer only bounded action candidates and verification tasks.

Real-world transfer pattern:

1. Generate many possible futures from the current state.
2. Prefer actions that are lawful, reversible, cheap, and positive under many
   branches.
3. Mark any action that requires outside evidence as blocked until the evidence
   exists.
4. Run a small real probe or manual verification step.
5. Feed the observed event back into VAU.
6. Keep matching futures, weaken partial matches, and discard wrong branches.

This makes inaccurate models useful without pretending they are accurate. A bad
model can still suggest a checklist, a question to ask, a safe experiment, or a
missing evidence item. It cannot open live mode, fabricate proof, or replace
human/legal/accounting/payment review.

## Why Evolutionary Search

Evolutionary algorithms fit VAU because the operating environment is noisy,
partly observed, non-differentiable, and full of mixed actions: documents,
prices, outreach, compliance gates, support capacity, treasury choices, and
human review.

They are useful when:

- reward is sparse or delayed,
- the simulator is incomplete,
- the action space is irregular,
- objectives conflict,
- many variants can be tested in parallel,
- diversity matters more than one polished policy,
- robustness across many futures is more important than optimizing one model.

Evolutionary search also supports intended inaccuracy. VAU can generate a large
population of imperfect futures, mutate them, and select the branches whose next
actions remain beneficial after reality corrects the model.

## Why Not Only RL

Reinforcement learning is useful when there is a stable environment, repeated
episodes, clear reward, and enough data to learn a policy. It is a poor default
when the environment is a live company with legal gates, human reactions,
non-repeatable events, sparse feedback, and high cost for unsafe exploration.

RL can still be used inside bounded subproblems:

- queue triage with historical ticket data,
- price experiments with strict guardrails,
- chess or game-like fixtures,
- simulated routing tasks with known rules.

For the whole-company loop, VAU should prefer evolutionary scenario search plus
human/reality correction. That keeps the system exploratory without pretending
the world is a clean Markov decision process.

## Quantity And Intended Inaccuracy

Sheer quantity matters because one forecast is fragile. Many futures create a
map of possible pressure points. Most branches can be wrong while still helping
the system find:

- recurring blockers,
- robust next actions,
- missing evidence,
- downside scenarios,
- safe positive probes.

Intended inaccuracy means VAU should avoid overfitting to a single predicted
future. It should keep multiple futures alive, use rough probability hints, and
prefer actions that improve the current state even when the exact story is
wrong.

The target is not perfect prediction. The target is positive reality pressure:
many small lawful actions that make the real state better after observation.

## Observation Changes Results

Observation can alter the result because measuring, asking, logging, warning,
or publishing a prediction changes behavior. In company operations, a prediction
is often an intervention.

VAU should treat observation effects explicitly:

- Predictions are not neutral when people can see and react to them.
- Public forecasts can become self-fulfilling or self-defeating.
- Asking a reviewer, customer, or operator changes the state being measured.
- Directly optimizing a visible metric can corrupt the metric.

Because of this, VAU should not force a single direct prediction when the
prediction itself can change reality. It should use branch populations,
uncertainty bands, private planning notes, and real observations after each
probe.

The goal is to alter reality in a positive way through lawful, useful, bounded
actions. Observation effects are not permission to deceive, manipulate, or fake
evidence.

## Developer Contract

For LLM/AI developers, the contract is:

- Use exact simulators only for exact domains, such as chess rules.
- For messy domains, output hypotheses and action probes, not certainty.
- Keep full state, assumptions, and evidence gaps in the payload.
- Return multiple futures, not one prophecy.
- Treat observation as a state-changing event.
- Preserve hard gates even when simulated futures look favorable.
- Evaluate success by real observed improvement, not by narrative fit.

VAU is strongest when it admits that the model is incomplete and uses reality to
correct itself.

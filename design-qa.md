final result: passed

Reference: Digital Twin Fab Simulator ImageGen mock.
Prototype URL checked: http://localhost:5178/

Checks completed:
- Desktop viewport 1440 x 1024 renders the simulator dashboard without blank primary panels.
- Mobile viewport 390 x 844 stacks controls, simulator visuals, results, quiz, and learning flow without horizontal page overflow.
- Canvas-based wafer map, cross-section, and profile chart render non-empty visual data.
- Equipment controls now show ideal operating windows, current value pins, and beginner-friendly OK/warning/out-of-range labels.
- The internal process view renders a process-specific visual for oxidation, photo, etch, diffusion, implant, deposition, metallization, and CMP.
- Basic/deep theory tabs are available per process, with process-stage cards explaining what happens inside the tool.
- Main simulator view now includes reference-style lower panels for process result summary, process status, and process notes before the quiz area.
- View tabs and export actions stay on one line at desktop width to better match the supplied metrology workstation reference.
- Chapter navigation includes all 8 processes plus integrated simulation and master evaluation.
- Simulation controls update process-specific metrics and PASS/RISK/FAIL state.
- Quiz answers remain hidden until the user submits for grading and explanation.

Remaining P3 polish:
- Future versions can add per-chapter 10-question quiz banks instead of the current shared master bank.
- Future versions can export a PDF process report from the current simulation state.

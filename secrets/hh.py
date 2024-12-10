from experta import *

class ComputerIssueExpert(KnowledgeEngine):
    @DefFacts()
    def initial_facts(self):
        yield Fact(action='diagnose')
    
    @Rule(Fact(action='diagnose'), Fact(no_power=True))
    def power_supply_problem(self):
        self.declare(Fact(issue="Power Supply Problem"))

    @Rule(Fact(action='diagnose'), Fact(blue_screen=True), Fact(slow_performance=True))
    def overheating_or_hardware_fault(self):
        self.declare(Fact(issue="Overheating or Hardware Fault"))

    @Rule(Fact(action='diagnose'), Fact(no_internet=True))
    def network_problem(self):
        self.declare(Fact(issue="Network Problem"))

    @Rule(Fact(action='diagnose'), Fact(blue_screen=True))
    def driver_issues(self):
        self.declare(Fact(suggestion="Check for Driver Issues"))

    @Rule(Fact(issue="Network Problem"))
    def verify_network_problem(self):
        print("Backward Chaining: Network Problem Verified")

    @Rule(Fact(issue=MATCH.issue))
    def display_issue(self, issue):
        print(f"Forward Chaining: Diagnosis - {issue}")

    @Rule(Fact(suggestion=MATCH.suggestion))
    def display_suggestion(self, suggestion):
        print(f"Forward Chaining: Suggestion - {suggestion}")


# Test Case 1: Forward Chaining
engine = ComputerIssueExpert()
engine.reset()
engine.declare(Fact(no_power=True), Fact(blue_screen=True), Fact(slow_performance=True))
engine.run()

# Test Case 2: Backward Chaining
engine = ComputerIssueExpert()
engine.reset()
engine.declare(Fact(no_internet=True))
engine.declare(Fact(issue="Network Problem"))
engine.run()

Backward Chaining: Network Problem Verified

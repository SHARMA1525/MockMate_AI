# Use Case Diagram - MockMate AI

```mermaid
useCaseDiagram
    actor "User" as U
    actor "Admin" as A

    package "User Operations" {
        U --> (Register)
        U --> (Login)
        U --> (Start Interview)
        U --> (Submit Answer)
        U --> (Submit Interview)
        U --> (View Score)
        U --> (View Interview History)
    }

    package "Admin Operations" {
        A --> (Add Question)
        A --> (Edit Question)
        A --> (Delete Question)
        A --> (View Users)
        A --> (View Interview Reports)
    }

    %% Shared operations
    (Login) -- A
```

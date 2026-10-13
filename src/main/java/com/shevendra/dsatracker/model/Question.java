
package com.shevendra.dsatracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "dsa_questions",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"topic", "title"}
    )
)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String topic;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false)
    private boolean solved = false;

    @Column(nullable = false, length = 20)
    private String difficulty = "Easy";

    @Column(name = "problem_url", length = 500)
    private String problemUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "last_solved_at")
    private LocalDateTime lastSolvedAt;

    protected Question() {}

    public Question(String topic, String title) {
        this.topic = topic;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public String getTopic() {
        return topic;
    }

    public String getTitle() {
        return title;
    }

    public boolean isSolved() {
        return solved;
    }

    public void setSolved(boolean solved) {
        this.solved = solved;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public void setProblemUrl(String problemUrl) {
        this.problemUrl = problemUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getLastSolvedAt() {
        return lastSolvedAt;
    }

    public void setLastSolvedAt(LocalDateTime lastSolvedAt) {
        this.lastSolvedAt = lastSolvedAt;
    }
}

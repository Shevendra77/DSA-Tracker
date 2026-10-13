
package com.shevendra.dsatracker.repository;

import com.shevendra.dsatracker.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Get all questions in ascending ID order
    List<Question> findAllByOrderByIdAsc();

    // Check whether a question already exists for a topic
    boolean existsByTopicAndTitle(String topic, String title);
}

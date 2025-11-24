package com.example.pensamientoComputacional.controller.rest;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ScoreboardWebSocketController {

    @MessageMapping("/scoreboard/exercise-completed")
    @SendTo("/topic/scoreboard")
    public Map<String, Object> broadcastExerciseCompletion(Map<String, Object> message) {
        return message;
    }

    @MessageMapping("/scoreboard/activity/{activityId}")
    @SendTo("/topic/scoreboard/activity/{activityId}")
    public Map<String, Object> broadcastActivityUpdate(Map<String, Object> message) {
        return message;
    }
}


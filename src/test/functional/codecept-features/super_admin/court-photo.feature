@fact-admin-tab-photo
Feature: Update court photo

  Background:
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over nav element
    When I click the photo tab

  Scenario: Deleting and adding photo
    When I check for existing photo then delete it
    Then I upload new photo
    Then I click update photo button
    Then A green message is displayed for "Photo updated"
    And the court is cleaned up through the API

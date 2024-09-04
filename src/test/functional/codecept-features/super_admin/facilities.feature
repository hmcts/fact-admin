@fact-admin-tab-facilities
Feature: Facilities

  Scenario: As a user I should be able to add and remove facilities successfully
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over nav element
    And I click the facilities tab
    When I enter facility "Parking" and enter description in english "englishDescription" and welsh "welshDescription"
    And I click on add new facility
    When I enter facility "Video facilities" and enter description in english "englishDescription" and welsh "welshDescription"
    And I click save in the facilities tab
    Then a green message is displayed for updated facilities "Court Facilities updated"
    And the facility entry in last position has index "52" description in english "englishDescription" and welsh "welshDescription"
    When I remove all existing facility entries and save
    Then a green message is displayed for updated facilities "Court Facilities updated"
    And there are no facility entries
    And the court is cleaned up through the API

  Scenario: As a user I should not be allowed to add duplicate facilities case
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over nav element
    And I click the facilities tab
    When I enter facility "Parking" and enter description in english "englishDescription" and welsh "welshDescription"
    And I click save in the facilities tab
    Then a green message is displayed for updated facilities "Court Facilities updated"
    When I enter facility "Parking" and enter description in english "englishDescription" and welsh "welshDescription"
    And I click save in the facilities tab
    And An error is displayed for facilities with summary "All facilities must be unique." and field message "Duplicated facility"
    And the court is cleaned up through the API

  Scenario: Prevent blank entries being added
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over nav element
    And I click the facilities tab
    When I enter facility "Parking" and enter description in english "" and welsh ""
    And I click save in the facilities tab
    Then An error is displayed for facilities with summary "Name and description are required for all court facilities." and description field message "Description is required"
    When I click clear in the facilities tab
    And I enter description in english "english"
    And I click save in the facilities tab
    Then An error is displayed for facilities with summary "Name and description are required for all court facilities." and name field message "Name is required"
    When I click clear in the facilities tab
    And I click save in the facilities tab
    Then a green message is displayed for updated facilities "Court Facilities updated"
    And the court is cleaned up through the API
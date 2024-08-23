Feature: Court Update Urgent Message

  Scenario: Adding urgent notice English & Welsh
    Given a court is created through the API
    When I log in as an admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I add an "Urgent Notice" in the rich editor field provided "#generalInfoTab #urgent-notice_ifr"
    When I have added the "Welsh translation of the urgent notice" in the Urgent Notice Welsh field
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    And the court is cleaned up through the API

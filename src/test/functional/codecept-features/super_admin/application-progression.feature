@fact-admin-tab-application-progression
Feature: Application Progression

  Background:
    Given a service centre court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over nav element
    When I click the application progression tab

  Scenario: Add and remove application types for Email
    When I remove all existing application types entries and save
    Then a green update message Application progression updated "Application Progressions updated"
    Then I entered "Get an update" in Type TextBox
    Then I entered "test@gmail.com" in Email TextBox
    Then I entered "welsh test" in welsh type TextBox
    Then I click on add new application progression
    And I click application progression save button
    Then I entered "Get an update" in Type TextBox
    Then I entered "test2@gmail.com" in Email TextBox
    Then I entered "welsh test2" in welsh type TextBox
    And I click application progression save button
    Then a green update message Application progression updated "Application Progressions updated"
    Then the second last Email is "test@gmail.com"
    And the last email is "test2@gmail.com"
    And the court is cleaned up through the API

  Scenario: Add and remove application types for External link
    When I remove all existing application types entries and save
    Then a green update message Application progression updated "Application Progressions updated"
    Then I entered "Get an update" in Type TextBox
    Then I entered "www.testlink.com" in External link TextBox
    Then I entered "test description" in External link description TextBox
    Then I entered "welsh test" in External link welsh description TextBox
    And I click application progression save button
    Then a green update message Application progression updated "Application Progressions updated"
    And the court is cleaned up through the API

  Scenario: Prevent blank entries being added
    When I remove all existing application types entries and save
    Then I entered "Get an update" in Type TextBox
    And I click application progression save button
    Then An error is displayed for application progression with summary "Enter an email address or an external link"
    Then I entered "www.testlink.com" in External link TextBox
    And I click application progression save button
    Then An error is displayed for application progression with summary "Description and link are required to add an external link"
    And the court is cleaned up through the API
#
  Scenario: Prevent duplicated entries being added
    When I remove all existing application types entries and save
    Then a green update message Application progression updated "Application Progressions updated"
    Then I entered "Get an update" in Type TextBox
    Then I entered "test@gmail.com" in Email TextBox
    Then I click on add new application progression
    And I click application progression save button
    Then I entered "Get an update" in Type TextBox
    Then I entered "test@gmail.com" in Email TextBox
    And I click application progression save button
    Then An error is displayed for application progression with summary "All email addresses must be unique."
    And the court is cleaned up through the API

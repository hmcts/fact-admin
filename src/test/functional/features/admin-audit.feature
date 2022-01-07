
Feature: courts audits

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button

  @ignore
  Scenario: view audits for super admin user
    When I click edit next to court with "havant-justice-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over opening hours nav element
    When I click the opening hours tab
    Then I can view the existing opening hours
    Then I check action start time
    And I enter a new opening hours entry by selecting description at index 5 and adding hours "10:00am to 4:00pm"
    And I click save
    Then a green update message is displayed in the opening hours tab
    When I remove all existing opening hours entries and save
    Then a green update message is displayed in the opening hours tab
    Then I check action end time
    Then I click on courts link
    When I click on audits link
    Then I select "havant-justice-centre" from courts
    Then I enter between and end date
    Then I click search audit button
    Then I can see the expected audits


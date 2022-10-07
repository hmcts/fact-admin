@fact-admin-tab-photo
Feature: Update court photo

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to court with "aberdeen-tribunal-hearing-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over nav element
    When I click the photo tab
    Then I can view the existing court photo form

  Scenario: Deleting and adding photo
    When I check for existing photo then delete it
    Then I upload new photo
    Then I click update photo button
    Then A green message is displayed for "Photo updated"

# -*- encoding: utf-8 -*-
# stub: erb 4.0.4 ruby lib
# stub: ext/erb/escape/extconf.rb

Gem::Specification.new do |s|
  s.name = "erb".freeze
  s.version = "4.0.4".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "homepage_uri" => "https://github.com/ruby/erb", "source_code_uri" => "https://github.com/ruby/erb" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Masatoshi SEKI".freeze, "Takashi Kokubun".freeze]
  s.bindir = "libexec".freeze
  s.date = "2024-01-04"
  s.description = "An easy to use but powerful templating system for Ruby.".freeze
  s.email = ["seki@ruby-lang.org".freeze, "k0kubun@ruby-lang.org".freeze]
  s.executables = ["erb".freeze]
  s.extensions = ["ext/erb/escape/extconf.rb".freeze]
  s.files = ["ext/erb/escape/extconf.rb".freeze, "libexec/erb".freeze]
  s.homepage = "https://github.com/ruby/erb".freeze
  s.licenses = ["Ruby".freeze, "BSD-2-Clause".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.7.0".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "An easy to use but powerful templating system for Ruby.".freeze

  s.installed_by_version = "3.5.18".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<cgi>.freeze, [">= 0.3.3".freeze])
end